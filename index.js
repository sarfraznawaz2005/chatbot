import { showLoading, hideLoading } from './utils/loading.js'
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { PromptTemplate } from 'langchain/prompts'
import { StringOutputParser } from 'langchain/schema/output_parser'
import { RunnablePassthrough, RunnableSequence } from "langchain/schema/runnable"
import { retriever } from './utils/retriever.js'
import { combineDocuments } from './utils/combineDocuments.js'
import { formatConvHistory } from './utils/formatConvHistory.js'
import { apiKey } from './config.js'

hideLoading();

document.addEventListener('submit', (e) => {
    e.preventDefault()
    progressConversation()
})

const llm = new ChatGoogleGenerativeAI({
	apiKey: apiKey,
	modelName: "gemini-pro",
	maxOutputTokens: 2048,
	verbose: false
});

const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
conversation history: {conv_history}
question: {question} 
standalone question:`

const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate)

const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about eTeam based on the context provided and the conversation history. Try to find the answer in the context. If the answer is not given in the context, find the answer in the conversation history if possible. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email info@eteamid.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
context: {context}
conversation history: {conv_history}
question: {question}
answer: `

const answerPrompt = PromptTemplate.fromTemplate(answerTemplate)

const standaloneQuestionChain = standaloneQuestionPrompt
    .pipe(llm)
    .pipe(new StringOutputParser())

const retrieverChain = RunnableSequence.from([
    prevResult => prevResult.standalone_question,
    retriever,
    combineDocuments
])

const answerChain = answerPrompt
    .pipe(llm)
    .pipe(new StringOutputParser())

const chain = RunnableSequence.from([
    {
        standalone_question: standaloneQuestionChain,
        original_input: new RunnablePassthrough()
    },
    {
        context: retrieverChain,
        question: ({ original_input }) => original_input.question,
        conv_history: ({ original_input }) => original_input.conv_history
    },
    answerChain
])

const convHistory = []

async function progressConversation() {
	showLoading();
	
    const userInput = document.getElementById('user-input')
    const chatbotConversation = document.getElementById('chatbot-conversation-container')
    const question = userInput.value
	
    userInput.value = ''

    // add human message
    const newHumanSpeechBubble = document.createElement('div')
	
    newHumanSpeechBubble.classList.add('speech', 'speech-human')
    chatbotConversation.appendChild(newHumanSpeechBubble)
    newHumanSpeechBubble.textContent = question
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight
    
	let response = await chain.invoke({
        question: question,
        conv_history: formatConvHistory(convHistory)
    })
	
	if (!response.length) {
		response = "I'm sorry, I don't know the answer to that. You can email info@eteamid.com for more information."
	}
    
	convHistory.push(question)
    convHistory.push(response)

    // add AI message
    const newAiSpeechBubble = document.createElement('div')
	
    newAiSpeechBubble.classList.add('speech', 'speech-ai')
    chatbotConversation.appendChild(newAiSpeechBubble)
    newAiSpeechBubble.textContent = response
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight
	
	hideLoading();
}