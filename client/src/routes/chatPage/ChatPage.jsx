import { useQuery } from '@tanstack/react-query';
import NewPrompt from '../../components/newPrompt/NewPrompt';
import './chatPage.css';
import model from "../../lib/gemini"
import { useLocation } from 'react-router-dom';
import Markdown from 'react-markdown';
import { IKImage } from 'imagekitio-react';
import { Fragment, useMemo, useState } from 'react';
import { getImageData } from '../../utils/getImageData';


const ChatPage = () => {

  const path = useLocation().pathname;
  const [chat, setChat] = useState(null);

  const chatId = path.split("/").pop();

  const { isPending, error, data } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () =>{
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
        credentials: "include",
      });
      const data = await res.json();
      setChat(await getChatSession(data));
      return data;
    }
  });


  const getChatSession = async (data) => {
    if (!data || !data.history) return null;

    const history = [];
    for (const message of data.history) {
      const parts = [];
      if (message.img) {
        const {data, mimeType} = await getImageData(message.img.url);
        if (data && mimeType) {
          parts.push({
            inlineData:{
              data: data,
              mimeType: mimeType
            }
          });
        }
      }
      parts.push(...message.parts.map(({ text }) => ({ text })));
      history.push({
        role: message.role === "user" ? "user" : "model",
        parts,
      });
    }
    return model.startChat({
      history,
    });
  }

  return (
    <div className="chatPage">
      <div className="wrapper">
        <div className="chat">
          {isPending
            ? "Loading..."
            : error
              ? "Something went wrong!"
              : data?.history?.map((message, i) => {
                return (
                  <Fragment key={i}>
                    {message.img && (
                      <IKImage
                        urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                        path={message.img.url}
                        height="300"
                        width="400"
                        transformation={[{ height: 300, width: 400 }]}
                        loading="lazy"
                        lqip={{ active: true, quality: 20 }}
                      />
                    )}
                    <div className={message.role === "user" ? "message user" : "message"}>
                      <Markdown>{message.parts[0].text}</Markdown>
                    </div>
                  </Fragment>
                )
              })}

          {data && <NewPrompt data={data} chat={chat} />}
        </div>
      </div>
    </div>
  )
}

export default ChatPage;