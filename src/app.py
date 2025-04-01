import gradio as gr
import sys
import os

# Add the src directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.utils.ai import generateWithGPT4
from src.utils.imageProcessing import extractLocationFromImage

def generate_content(image):
    try:
        # Extract location from image
        location = extractLocationFromImage(image)
        
        # Generate content using GPT-4
        content = generateWithGPT4(location)
        
        # Format the output
        output = f"""
        📍 Location: {location}
        
        ✨ Caption:
        {content['caption']}
        
        🏷️ Hashtags:
        {' '.join(content['hashtags'])}
        
        🎨 Mood:
        {content['mood']}
        """
        
        return output
    except Exception as e:
        return f"Error: {str(e)}"

# Create Gradio interface
iface = gr.Interface(
    fn=generate_content,
    inputs=gr.Image(type="filepath", label="Upload an image"),
    outputs=gr.Textbox(label="Generated Content", lines=10),
    title="Social Content Generator",
    description="Upload an image to generate social media content based on the location.",
    examples=[],  # You can add example images here
    theme=gr.themes.Soft()
)

if __name__ == "__main__":
    iface.launch() 