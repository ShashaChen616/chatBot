

const imageDataMap = new Map();

export const setImageData = (url, imageData) => {
  imageDataMap.set(url, imageData);
}


export const getImageData = async (url) => {
  if (imageDataMap.has(url)){
    return imageDataMap.get(url);
  }

  const res = await fetch(`https://ik.imagekit.io/mimichatbot${url}`);
  if (!res.ok) {
    console.error("Failed to fetch image:", url);
    return { data: null, mimeType: null };
  }

  const blob = await res.blob();
  const mimeType = blob.type;

  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const aiData = base64?.split(',')?.[1]

  const imageData = { data: aiData ?? null, mimeType: mimeType ?? null };

  if (aiData && mimeType){
    imageDataMap.set(url, imageData);
  }
  return imageData;
}

