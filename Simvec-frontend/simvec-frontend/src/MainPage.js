import React, { useState } from 'react';
import './MainPage.css';
import logo from './simvec.png';

const base64ToBlob = (base64) => {
  const standardBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  const parts = standardBase64.split(';base64,');
  
  if (parts.length === 2) {
    const mimePart = parts[0];
    const base64Part = parts[1];
    const byteString = atob(base64Part);
    const mimeString = mimePart.split(':')[1];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  } else {
    throw new Error('The provided string does not seem to be correctly Base64 encoded.');
  }
};

function ImageUpload() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [text, setText] = useState('');
  const [searchNumber, setSearchNumber] = useState(5);
  const handleTextChange = (e) => {
    setText(e.target.value);
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please select an image to upload");
      return;
    }
    const formData = new FormData();
    formData.append('file', image);
    console.log(image);
    try {
      const response = await fetch(`http://localhost:8080/api/image-based-search/${searchNumber}`, {
        method: 'POST',
        body: formData,
      });
      const base64Images = await response.json();
      console.log(base64Images);
      const urls = base64Images.map(base64 => `data:image/jpeg;base64,${base64}`);
      setImageList(urls);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
    }
  };

  const data = {
    input: text,
    topk: searchNumber
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!text) {
      alert("Please enter some text");
      return;
    }
  
    try {
      const response = await fetch('http://localhost:8080/api/text-based-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const base64Images = await response.json();
      const urls = base64Images.map(base64 => `data:image/jpeg;base64,${base64}`);
      setImageList(urls);
    } catch (error) {
      console.error("Error processing text:", error);
      alert("Error processing text");
    }
  };

  const handleNumberChange = (e) => {
    setSearchNumber(e.target.value);
  };

  return (
    <>
      <div className='header'>
        <img src={logo} alt="Logo" className="website-logo" />
      </div>
    <div className="container">
    
  
      <div className="image-upload-container">
        <form className='input-form' onSubmit={handleSubmit}>
          <input 
            type="file" 
            onChange={handleImageChange} 
            style={{ display: 'none' }} 
            id="file-upload"
          />
          <label htmlFor="file-upload" className="image-upload-label">
            {preview ? <img src={preview} alt="Preview" className="image-preview" /> : "Click to select an image"}
          </label>

          {/* Number of Images Selection */}
          <div className="number-selection-container">
            <label htmlFor="number-input" className="number-input-label">Number of Images:</label>
            <input 
              id="number-input"
              type="number" 
              value={searchNumber}
              onChange={handleNumberChange}
              className="number-input"
              min="1"
            />
          </div>

          <button type="submit" className="upload-btn">Upload</button>
        </form>
      </div>

      <div className="text-submission-container">
        <form className='input-form' onSubmit={handleTextSubmit}>
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Enter text here"
            className="text-input"
          />
          <button type="submit" className="submit-btn">Submit Text</button>
        </form>
      </div>

      {imageList.length > 0 && (
        <div className="image-list-container">
          <h3>Returned Images:</h3>
          {imageList.map((imgSrc, index) => (
            <img key={index} src={imgSrc} alt={`Result ${index}`} className="returned-image" />
          ))}
        </div>
      )}
    </div>
    </>
  );
}

export default ImageUpload;
