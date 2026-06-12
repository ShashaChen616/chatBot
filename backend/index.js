import express from 'express';
import cors from 'cors';
import ImageKit from 'imagekit';
import mongoose from 'mongoose';
import { setServers } from "node:dns/promises";
import Chat from "./models/chat.js";
import UserChats from "./models/userChats.js";
import { clerkMiddleware, getAuth } from '@clerk/express';
import path from 'path';
import { fileURLToPath } from 'url';

const port = process.env.PORT || 3000;
const app = express();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, 'dist');

// Serve the files raw
app.use(express.static(distPath));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({limit: '50mb' }))
app.use(clerkMiddleware())

const connect = async () => {
  try {
    setServers(["1.1.1.1", "8.8.8.8"]);
    await mongoose.connect(process.env.MONGO ?? '')
    console.log("Connected to MongoDB")
  } catch (err) {
    console.log(err)
  }
}

const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT ?? '',
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY ?? '',
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY ?? '',
});

app.get('/api/upload', (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});

// app.get("/api/test", (req,res)=> {
//   const auth = getAuth(req);
//   if (!auth.isAuthenticated){
//     console.log("This user is not authenticated");
//     res.send('failed')
//     return;
//   }
//   console.log("Success");
//   res.send("Success!" + auth.sessionStatus);
// });

app.post('/api/chats', async (req, res) => {
  const auth = getAuth(req)

  if (!auth.isAuthenticated) {
    res.redirect("/sign-in")
    return;
  }

  const { text } = req.body;
  const userId = auth.userId;

  try {
    //CREATE A NEW CHAT
    const newChat = new Chat({
      userId: userId,
      history: [{ role: "user", parts: [{ text }] }]
    })

    const savedChat = await newChat.save();

    //CHECK IF USERCHATS EXISTS
    const userChats = await UserChats.find({ userId: userId });

    //IF CHAT DOESN'T EXIT, CREATE A NEW CHAT AND ADD IT IN THE CHATS ARRAY
    if (!userChats.length) {
      const newUserChats = new UserChats({
        userId: userId,
        chats: [
          {
            _id: savedChat._id,
            title: text.substring(0, 40),
          },
        ],
      });

      await newUserChats.save()
    } else {
      //IF EXISTS, PUSH THE CHAT TO THE EXISTING ARRAY
      await UserChats.updateOne({ userId: userId }, {
        $push: {
          chats: {
            _id: savedChat._id,
            title: text.substring(0, 40),
          },
        },
      });

      res.status(201).send(newChat._id);
    }
  } catch (err) {
    console.log(err)
    res.status(500).send("Error creating chat!")
  }
});

app.get("/api/userchats", async (req, res) => {
  const auth = getAuth(req);
  if (!auth.isAuthenticated) {
    res.redirect("/sign-in")
    return;
  }
  const userId = auth.userId;

  try {
    const userChats = await UserChats.find({ userId });
    const chats = userChats?.[0]?.chats ?? []
    res.status(200).send(chats);
  } catch (err) {
    console.log(err)
    res.status(500).send("Error fetching userchat!")
  }

});

app.get("/api/chats/:id", async (req, res) => {
  const auth = getAuth(req);
  if (!auth.isAuthenticated) {
    res.redirect("/sign-in")
    return;
  }
  const userId = auth.userId;

  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId });
    res.status(200).send(chat);
  } catch (err) {
    console.log(err)
    res.status(500).send("Error fetching chat!")
  }

});

app.put("/api/chats/:id", async (req, res) => {
  const auth = getAuth(req);
  if (!auth.isAuthenticated) {
    res.redirect("/sign-in")
    return;
  }
  const userId = auth.userId;

  const { question, answer, img } = req.body;

  const newItems = [
    ...(question
      ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }]
      : []),
    { role: "model", parts: [{ text: answer }] },
  ]

  try {
    const updatedChat = await Chat.updateOne({ _id: req.params.id, userId }, {
      $push: {
        history: {
          $each: newItems,
        }
      }
    });
    res.status(200).send(updatedChat);
  } catch (err) {
    console.log(err)
    res.status(500).send("Error adding conversation!")
  }
});

app.get(/.*$/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).send('Unauthenticated!');
});

app.listen(port, () => {
  connect()
  console.log(`Server is running on 3000`);
}); 