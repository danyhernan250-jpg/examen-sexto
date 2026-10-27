// netlify/functions/calificar.js
import { GoogleGenAI } from "@google/genai";

export default async (req, context) => {
  try {
    const { pregunta, respuestaEstudiante, rubrica } = await req.json();
    
    // Netlify inyecta automáticamente la GEMINI_API_KEY que configuraste en el paso 6
    const genAI = new GoogleGenAI({}); 

    const prompt = `
      Eres un profesor de matemática de sexto grado. Evalúa la respuesta del estudiante.
      
      Pregunta: "${pregunta}"
      Rúbrica de evaluación: "${rubrica}"
      Respuesta del estudiante: "${respuestaEstudiante}"
      
      Devuelve un objeto JSON con esta estructura exacta:
      {
        "nota": <número entre 0 y 1>,
        "feedback": "<explicación breve y motivadora para el estudiante>",
        "correcto": <true si la nota >= 0.7, false en caso contrario>
      }
    `;

    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-flash', // Modelo rápido y económico
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultado = JSON.parse(response.text);
    
    return new Response(JSON.stringify(resultado), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error en calificación:", error);
    return new Response(JSON.stringify({ 
      error: "No se pudo calificar",
      nota: 0,
      feedback: "Hubo un error al calificar esta respuesta. El profesor la revisará manualmente.",
      correcto: false
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = { path: "/api/calificar" };