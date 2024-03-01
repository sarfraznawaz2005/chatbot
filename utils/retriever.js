import { MemoryVectorStore } from "langchain/vectorstores/memory"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import axios from 'axios';
import { apiKey } from '../config.js'
import { BASE_URL } from './url.js'

const fullUrl = `${BASE_URL}/data.php`;

let text = '';

await axios.post(fullUrl)
.then(response => {
    text = response.data.data;
})
.catch(error => {
    alert(error);
});

const textSplitter = new RecursiveCharacterTextSplitter({ 
	chunkSize: 500,
	separators: ["\n\n", "\n", " ", ""], // default
	chunkOverlap: 0
});

const docs = await textSplitter.createDocuments([text]);
//console.log(docs);

const vectorStore = await MemoryVectorStore.fromDocuments(docs, new GoogleGenerativeAIEmbeddings({apiKey: apiKey}));

const retriever = vectorStore.asRetriever()

export { retriever }