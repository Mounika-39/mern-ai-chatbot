import axios from "axios";
import dotenv from "dotenv";
import PDFParser from "pdf2json";

dotenv.config();

// Helper function to parse PDF from buffer
const parsePDFBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on("pdfParser_dataError", (err) => {
      console.error("PDF Parse Error:", err);
      reject(err);
    });
    
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        // Extract text from PDF pages
        let fullText = "";
        if (pdfData && pdfData.Pages) {
          pdfData.Pages.forEach(page => {
            if (page.Texts) {
              page.Texts.forEach(text => {
                if (text.R && text.R[0] && text.R[0].T) {
                  fullText += decodeURIComponent(text.R[0].T) + " ";
                }
              });
            }
          });
        }
        resolve(fullText);
      } catch (err) {
        reject(err);
      }
    });
    
    pdfParser.parseBuffer(buffer);
  });
};

export const chatWithAI = async (req, res) => {
  try {
    const { message, history, hasFile, fileName, fileType, fileData } = req.body;

    console.log("📨 Received message:", message?.substring(0, 100) || "No message");
    console.log("📎 Has file:", hasFile);
    if (hasFile) {
      console.log("📎 File name:", fileName);
      console.log("📎 File type:", fileType);
      console.log("📎 File data length:", fileData?.length || 0);
    }

    let extractedText = "";
    
    // Extract text from PDF if it's a PDF file
    if (hasFile && fileType === 'application/pdf' && fileData) {
      try {
        console.log("📄 Extracting text from PDF using pdf2json...");
        
        // Remove the data:application/pdf;base64, prefix if present
        let base64Data = fileData;
        if (base64Data.includes(',')) {
          base64Data = base64Data.split(',')[1];
        }
        
        if (!base64Data) {
          console.log("⚠️ No base64 data found");
          extractedText = "Could not extract PDF content - no data found";
        } else {
          const pdfBuffer = Buffer.from(base64Data, 'base64');
          console.log("📦 PDF Buffer size:", pdfBuffer.length);
          
          // Parse PDF using pdf2json
          extractedText = await parsePDFBuffer(pdfBuffer);
          
          console.log("✅ PDF extracted successfully!");
          console.log("📝 Extracted text length:", extractedText.length);
          console.log("📝 First 300 chars:", extractedText.substring(0, 300));
          
          // Limit text to avoid token limits
          if (extractedText.length > 5000) {
            extractedText = extractedText.substring(0, 5000) + "\n\n...[Content truncated due to length]...";
          }
        }
      } catch (pdfError) {
        console.error("❌ PDF parsing error:", pdfError.message);
        extractedText = `[Error parsing PDF: ${pdfError.message}]`;
      }
    }
    
    // For text files
    if (hasFile && (fileType === 'text/plain' || fileName?.endsWith('.txt') || fileName?.endsWith('.md')) && fileData) {
      try {
        console.log("📄 Extracting text from text file...");
        let base64Data = fileData;
        if (base64Data.includes(',')) {
          base64Data = base64Data.split(',')[1];
        }
        if (base64Data) {
          extractedText = decodeURIComponent(escape(atob(base64Data)));
          console.log("✅ Text extracted, length:", extractedText.length);
          if (extractedText.length > 5000) {
            extractedText = extractedText.substring(0, 5000) + "\n\n...[Content truncated]...";
          }
        }
      } catch (err) {
        console.error("Error reading text file:", err);
        extractedText = `[Error reading text file: ${err.message}]`;
      }
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.log("⚠️ No API key, using demo response");
      let demoReply = `I received your message: "${message || 'No message'}".`;
      
      if (hasFile && extractedText) {
        demoReply = `📄 **File: ${fileName}**\n\nHere's what I found in the file:\n\n${extractedText.substring(0, 800)}...\n\nWhat would you like to know more about?`;
      } else if (hasFile) {
        demoReply = `I received your file "${fileName}". I'm having trouble extracting text. What would you like to know about it?`;
      }
      
      return res.json({ reply: demoReply });
    }

    // Build messages array with context
    const messages = [];
    
    // Add system prompt
    messages.push({
      role: "system",
      content: `You are a helpful AI assistant that can read and analyze files including PDFs and text files. 
      You maintain conversation context and provide detailed, accurate responses.
      When users upload files, you analyze their content and answer questions based on what's in the file.
      Be thorough, detailed, and helpful. Provide specific information from the file content.`
    });
    
    // Add conversation history (last 15 messages for context)
    if (history && history.length > 0) {
      const recentHistory = history.slice(-15);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }
    
    // Build current message with file context
    let currentMessage = message || "Please analyze this file";
    
    if (hasFile && extractedText && extractedText.length > 50) {
      currentMessage = `${currentMessage}\n\n📄 **File: ${fileName}**\n**File Type:** ${fileType}\n\n**Extracted Content:**\n${extractedText}\n\nBased on the content above, please answer the question or provide analysis.`;
    } else if (hasFile) {
      currentMessage = `${currentMessage}\n\n📄 **File: ${fileName}**\n**File Type:** ${fileType}\n\nI couldn't extract text from this file. It might be an image or scanned document. Please describe what you'd like to know about this file.`;
    }
    
    messages.push({
      role: "user",
      content: currentMessage
    });

    console.log("📤 Sending to OpenRouter with", messages.length, "messages");

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "AI Chatbot"
        },
        timeout: 60000
      }
    );

    const reply = response.data.choices[0].message.content;
    console.log("✅ AI response sent, length:", reply.length);
    res.json({ reply });

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
    }
    
    let fallbackReply = `I received your message.`;
    
    if (req.body.hasFile) {
      fallbackReply = `I received your file "${req.body.fileName}". Please tell me what specific information you're looking for.`;
    } else {
      fallbackReply = `I received your message: "${req.body.message || 'No message'}". How can I help you?`;
    }
    
    res.json({ 
      reply: fallbackReply,
      error: false 
    });
  }
};