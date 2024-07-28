import json
import requests
import numpy as np
import csv
import os
from glob import glob
from pathlib import Path
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility

##############
from PIL import Image
import pandas as pd
import torch
from transformers import CLIPProcessor, CLIPModel, BlipModel, BlipProcessor, BlipForConditionalGeneration

# Load the CLIP model and processor
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch16")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch16")

search_params = {
    "metric_type": "L2",
    "offset": 0,
    "ignore_growing": False,
    "params": {"nprobe": 10}
}

# Milvus parameters
HOST = '127.0.0.1'
PORT = '19530'
TOPK = None # number of results to return

DIM = 512
INDEX_TYPE = 'IVF_FLAT'
METRIC_TYPE = 'L2'

def csv_maker(dataset_path, user_id):
    # Directory where the CSV files will be saved
    csv_directory = "user_datasets"

    if not os.path.exists(csv_directory):
        os.makedirs(csv_directory)

    output_csv = os.path.join(csv_directory, "image_paths_" + str(user_id) + ".csv")

    image_data = []
    id_counter = 0

    for root, dirs, files in os.walk(dataset_path):
        for file in files:
            if file.endswith(('.PNG', '.JPG', '.JPEG', '.png', '.jpg', '.jpeg')):
                image_path = os.path.join(root, file)
                image_data.append([id_counter, image_path])
                id_counter += 1

                # Debug print to check the file paths being added
                #print(f"Adding: {id_counter}, {image_path}")

    with open(output_csv, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['id', 'path'])
        for data in image_data:
            writer.writerow(data)

    if image_data:
        print(f"Paths and IDs of all images have been written to {output_csv}")
    else:
        print(f"No images found. Please check the dataset path and file extensions.")
    return output_csv


# Create milvus collection (delete first if exists)
def create_milvus_collection(collection_name, model):
    if utility.has_collection(collection_name):
        utility.drop_collection(collection_name)
    if isinstance(model, CLIPModel):
        fields = [
            FieldSchema(name='path', dtype=DataType.VARCHAR, description='path to image', max_length=500,
                        is_primary=True, auto_id=False),
            FieldSchema(name='embedding', dtype=DataType.FLOAT_VECTOR, description='image embedding vectors', dim=DIM)
        ]
        schema = CollectionSchema(fields=fields, description='image search')
        collection = Collection(name=collection_name, schema=schema)

        index_params = {
            'metric_type': METRIC_TYPE,
            'index_type': INDEX_TYPE,
            'params': {"nlist": DIM}
        }
        collection.create_index(field_name='embedding', index_params=index_params)
        return collection
    elif isinstance(model, BlipForConditionalGeneration):
        fields = [
            FieldSchema(name='path', dtype=DataType.VARCHAR, description='path to image', max_length=500,
                        is_primary=True, auto_id=False),
            FieldSchema(name='embedding', dtype=DataType.FLOAT_VECTOR, description='image embedding vectors', dim=512)
        ]
        schema = CollectionSchema(fields=fields, description='image search')
        collection = Collection(name=collection_name, schema=schema)

        index_params = {
            'metric_type': METRIC_TYPE,
            'index_type': INDEX_TYPE,
            'params': {"nlist": 512}
        }
        collection.create_index(field_name='embedding', index_params=index_params)
        return collection

def create_milvus_entities(user_dataset, model, processor):
    embeddings = []
    df = pd.read_csv(user_dataset)

    for index, row in df.iterrows():
        image_path = row['path']
        image = Image.open(image_path).convert('RGB')  # Ensure image is in RGB
        inputs = processor(images=image, return_tensors="pt")

        # Depending on the model used, the method to get embeddings will differ
        #if isinstance(model, CLIPModel):
        image_features = model.get_image_features(**inputs)
        embedding = image_features.squeeze(0).detach().numpy().tolist()
        norm_embedding = embedding / np.linalg.norm(embedding)
        """
        elif isinstance(model, BlipForConditionalGeneration):
            image_features = model.generate(**inputs, max_new_tokens=512)
            embedding = image_features.squeeze(0).detach().numpy().tolist()
            norm_embedding = embedding / np.linalg.norm(embedding)
            if len(embedding) < 512:
                norm_embedding = np.pad(norm_embedding, (0, 512 - len(norm_embedding)))
            #print(len(norm_embedding))
        """
        embeddings.append(norm_embedding)




    paths = df['path'].tolist()
    entities = [[path for path in paths],
                [embedding for embedding in embeddings]]
    return entities


def initialize_milvus(collection_name, image_folder_path, model, processor):
    # Connect to Milvus service
    connections.connect(host=HOST, port=PORT)

    # display all the collections
    print(utility.list_collections())
    #drop all collections
    #collections = utility.list_collections()
    #for collection in collections:
    #    utility.drop_collection(collection)

    # Check if the collection already exists
    if(utility.has_collection(collection_name)):
        collection = Collection(collection_name)
        print(f"Using existing collection: {collection_name}")

    else:
        print(f"Creating new collection: {collection_name}")
        collection = create_milvus_collection(collection_name, model)
        entities = create_milvus_entities(image_folder_path, model, processor)
        mr = collection.insert(entities)
        print("mr: ", mr)

    return collection

@csrf_exempt
@require_http_methods(["POST"])
def create_collection_for_new_user(request):
    # request decoding
    data = json.loads(request.body)
    user_id = data.get('user_id')
    # get the path of the image folder of the user
    image_folder_path = data.get('image_folder_path')
    model_option = data.get('model_option', 'clip')  # Default to 'clip' if not specified

    # Load the appropriate model
    if model_option == 'clip':
        model = CLIPModel.from_pretrained("openai/clip-vit-base-patch16")
        processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch16")
    elif model_option == 'blip':
        model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
        processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
        print("Using BLIP model")
    else:
        return JsonResponse({'error': 'Invalid model option'}, status=400)

    # Rest of your existing code to create collection
    collection_name = 'user_' + str(user_id) + '_gallery'
    user_dataset = csv_maker(image_folder_path, user_id)
    print(user_dataset)
    collection = initialize_milvus(collection_name, user_dataset, model, processor)
    collection.load()

    return JsonResponse({'message': 'Collection created successfully', 'collection_name': collection_name})

@csrf_exempt
@require_http_methods(["POST"])
def image_based_search(request):
    # request decoding
    data = json.loads(request.body)
    topk = data.get('topk')
    query_image_path = data.get('input')
    print(query_image_path)
    user_id = data.get('username')
    #user_id = "alper"
    model_option = data.get('model_option', 'clip')  # Default to 'clip' if not specified
    collection_name = 'user_' + str(user_id) + '_gallery'
    model = None
    if model_option == 'clip':
            model = CLIPModel.from_pretrained("openai/clip-vit-base-patch16")
            processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch16")
    elif model_option == 'blip':
        model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
        processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")

    collection = initialize_milvus(collection_name, None, model, processor)
    collection.load()
    try:
        query_image = Image.open(query_image_path).convert('RGB')
        query_inputs = processor(images=query_image, return_tensors="pt")
        query_image_features = model.get_image_features(**query_inputs)
        image_embedding = query_image_features.squeeze(0).detach().numpy().tolist()
        norm_embedding = image_embedding/np.linalg.norm(image_embedding)

        distance_threshold = 0.805 # similarity threshold

        results = collection.search(
            data=[norm_embedding],
            anns_field="embedding",
            # the sum of `offset` in `param` and `limit`
            # should be less than 16384.
            param=search_params,
            limit=(int) (topk),
            expr=None,
        )
        # Process results: filter based on distance
        filtered_results = []
        for result in results[0]:
            if (result.distance) < (distance_threshold):
                #print(result.distance)
                formatted_id = "/" + result.id[1:]
                filtered_results.append(formatted_id)

        return JsonResponse({'message': 'Image processed successfully', 'results': list(filtered_results)})

    except Exception as e:
        # Handle any errors that occur during the process
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def text_based_search(request):
    # request decoding
    data = json.loads(request.body)
    topk = data.get('topk')
    query_text = data.get('input')
    #user_id = data.get('user_id')
    user_id = data.get('username')
    model_option = data.get('model_option', 'clip')  # Default to 'clip' if not specified
    collection_name = 'user_' + str(user_id) + '_gallery'
    model = None
    if model_option == 'clip':
            model = CLIPModel.from_pretrained("openai/clip-vit-base-patch16")
            processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch16")
    elif model_option == 'blip':
        model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
        processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")

    # Connect to Milvus service

    #collection_name = 'user_2_gallery'
    print(collection_name)
    collection = initialize_milvus(collection_name, None, model, processor)
    collection.load()

    try:

        text_inputs = processor(text=query_text, return_tensors="pt", padding=True, truncation=True, max_length=77)
        query_text_features = model.get_text_features(**text_inputs)
        text_embedding = query_text_features.squeeze(0).detach().numpy().tolist()
        norm_text_embedding = text_embedding/np.linalg.norm(text_embedding)

        distance_threshold = 1.502 # similarity threshold

        results = collection.search(
            data=[norm_text_embedding],
            anns_field="embedding",
            # the sum of `offset` in `param` and `limit`
            # should be less than 16384.
            param=search_params,
            limit=(int) (topk),
            expr=None,
        )
        # Process results: filter based on distance
        filtered_results = []
        for result in results[0]:
            if (result.distance) < (distance_threshold):
                #print(result.distance)
                formatted_id = "/" + result.id[1:]
                filtered_results.append(formatted_id)

        return JsonResponse({'message': 'Image processed successfully', 'results': list(filtered_results)})

    except Exception as e:
        # Handle any errors that occur during the process
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def image_embedding_and_storage(request):
    #data = json.loads(request.body)
    user_id = request.POST.get('user_id')

    operation = request.POST.get('operation')
    # I need to find the user's csv file and collection, and update them with the new images
    user_dataset = 'user_datasets/image_paths_' + (str) (user_id) + '.csv'


    collection_name = 'user_' + (str) (user_id) + '_gallery'
    collection = initialize_milvus(collection_name, None, model, processor)
    if operation == 'insert':
        updated_images = request.FILES.getlist('updated_images')  # Get list of image files
        if len(updated_images)==0:
            return JsonResponse({'message': 'Images added successfully', 'collection_name': collection_name})

        print("updated_images in insert: ", updated_images)
        # get the id of the last image in the csv file

        with open(user_dataset, 'r') as file:
            reader = csv.reader(file)
            data = list(reader)
            last_id = data[-1][0]

        # add the new images to the csv file
        # create a temp csv file to store the new images
        last_id = (int) (last_id) + 1
        temp_csv = 'temp_image_paths_' + (str) (user_id) + '.csv'
        with open(temp_csv, 'w', newline='') as file:

            writer = csv.writer(file)
            writer.writerow(['id', 'path'])
            for image in updated_images:
                writer.writerow([last_id, image])
                last_id = (int) (last_id) + 1

        # add the temp csv to the user's csv file
        with open(user_dataset, 'a') as f:
            with open(temp_csv, 'r') as t:
                next(t)
                for line in t:
                    f.write(line)
        # insert the new images to the collection
        entities = create_milvus_entities(temp_csv)
        mr = collection.insert(entities)
        collection.load()

        #delete the temp csv file
        os.remove(temp_csv)
        #print("mr: ", mr)

        return JsonResponse({'message': 'Images added successfully', 'collection_name': collection_name})
    elif operation == 'delete':
        updated_images = request.FILES.getlist('updated_images')
        if len(updated_images)==0:
            return JsonResponse({'message': 'Images deleted successfully', 'collection_name': collection_name})


        print("updated_images: ", updated_images)

        expr = " || ".join([f"path == '{path}'" for path in updated_images])
        mr = collection.delete(expr)
        #print("mr: ", mr)
        collection.load()
        collection.flush()
        # delete the images from the csv file
        df = pd.read_csv(user_dataset)
        df = df[~df['path'].isin(updated_images)]
        df.to_csv(user_dataset, index=False)

        return JsonResponse({'message': 'Images deleted successfully', 'collection_name': collection_name})

