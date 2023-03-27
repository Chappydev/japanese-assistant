import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (!(req.body && req.body.content)) {
    return res.status(400).json({ error: "must include content" });
  }
  console.log(req.body);

  try {
    const { data } = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Expand any contractions. You must not change anything else 
            Original: やばっ！
            Expanded: やばい！
            Original: お前は今すぐやらなきゃ
            Expanded: お前は今すぐやらなければいけない
            Original: ${req.body.content}
            Expanded: `,
        },
      ],
      temperature: 0.1,
    });
    console.log(data);

    res.status(200).json(data.choices[data.choices.length - 1].message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}