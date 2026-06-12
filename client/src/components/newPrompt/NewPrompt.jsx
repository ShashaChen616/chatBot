import { useEffect, useRef, useState } from 'react';
import './newPrompt.css';
import Upload from '../upload/Upload';
import { IKImage } from 'imagekitio-react';

import Markdown from "react-markdown"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setImageData } from '../../utils/getImageData';

const NewPrompt = ({ data, chat }) => {

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [submitDisabled, setSubmitDisabled] = useState(false);

  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });

  const endRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data, question, answer, img.dbData]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (answer) => {
      const imageUrl = img.dbData?.filePath
      const imageData = img.aiData?.inlineData?.data
      const imageMimeType = img.aiData?.inlineData?.mimeType
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: question.length ? question : undefined,
          answer,
          img: {
            url: imageUrl,
          } || undefined,
        }),
      });

      if (imageUrl && imageData && imageMimeType){
        setImageData(imageUrl, {data: imageData, mimeType: imageMimeType})
      }
      
      if (!res.ok) {
        throw new Error("Failed to update chat");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ['chat', data._id] })
        .then(() => {
          formRef.current.reset();
          setQuestion("");
          setAnswer("");
          setImg({
            isLoading: false,
            error: "",
            dbData: {},
            aiData: {},
          });
          setSubmitDisabled(false);
        }).catch(() => {
          setSubmitDisabled(false);
        });
    },
    onError: (err) => {
      console.log(err);
      setSubmitDisabled(false);
    },
  });

  const add = async (text, isInitial) => {
    if (!isInitial) setQuestion(text)

    try {
      const result = await chat.sendMessageStream(
        Object.entries(img.aiData).length ? [img.aiData, text] : [text]
        // {
        //   contents: [{
        //     role: "user",
        //     parts: [{ text }]
        //   }],
        //   systemInstruction: "You are Roleplaying Mimi Chatbot, and you like to say Meow~. Do not show original model name."
        // }
      );
      let accumulatedText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        accumulatedText += chunkText;
        setAnswer(accumulatedText)
      }

      mutation.mutate(accumulatedText);
    } catch (err) {
      console.log(err);
      setSubmitDisabled(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitDisabled) return;

    const text = e.target.text.value;
    if (!text) return;

    setSubmitDisabled(true);
    add(text, false);
  }

  //IN PRODUCTION WE DON"T NEED IT
  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current) {
      if (data?.history?.length === 1) {
        add(data.history[0].parts[0].text, true);
      }
    }
    hasRun.current = true;
  }, []);

  if (!chat) {
    return null;
  }

  return (
    <>
      {img.isLoading && <div className=''>Loading...</div>}
      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
          path={img.dbData?.filePath}
          width="380"
          transformation={[{ width: 380 }]}
        />
      )}
      {question && <div className='message user'>{question}</div>}
      {answer && <div className='message'><Markdown>{answer}</Markdown></div>}
      <div className="endChat" ref={endRef}></div>
      <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
        <Upload setImg={setImg} />
        {/* <label htmlFor='file'>
          <img src="/attachment.png" alt="" />
        </label> */}
        <input id='file' type='file' multiple={true} hidden />
        <input type="text" name="text" placeholder='Ask me anything...' />
        <button className={submitDisabled ? 'disabled' : undefined}>
          <img src="/arrow.png" alt="" />
        </button>
      </form>
    </>
  )
}

export default NewPrompt;