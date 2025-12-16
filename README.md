# Brain Mapper

Brain Mapper is a personal knowledge base and note-taking application designed to help you capture, organize, and visualize your thoughts.

## Project Architecture & Wireframe

The following diagram illustrates the project structure and the flow between the Landing Page and the Application.

> **Note**: Please update this README and the diagram below whenever there are architectural changes to the project.

```mermaid
graph TD
    subgraph "Landing Page (index.html)"
        Home[Home Section]
        About[About Section]
        Nav[Sticky Navbar]
        
        Nav -->|Link| Home
        Nav -->|Link| About
        Home -->|Scroll Down| About
        Home -->|Click 'Get Started'| App
        Nav -->|Click 'Launch App'| App
        
        style Home fill:#2a1b3d,stroke:#7c3aed,color:#fff
        style About fill:#1e1e1e,stroke:#7c3aed,color:#fff
        style Nav fill:#2a2a2a,stroke:#fff,color:#fff
    end

    subgraph "Assets"
        CSS[style.css]
        JS[script.js]
        
        index.html -.->|Imports| CSS
        index.html -.->|Imports| JS
    end

    subgraph "Application (note-file.html)"
        App[Note Taking App]
        Editor[Text Editor]
        Graph[Graph View]
        Chat[AI Assistant]
        
        App -->|Contains| Editor
        App -->|Contains| Graph
        App -->|Contains| Chat
        
        Editor <-->| bi-directional link | Graph
        Chat -.->|Queries| Editor
        
        style App fill:#1e1e1e,stroke:#00ff00,stroke-width:2px,color:#fff
    end
```

## Component Breakdown

1.  **`index.html`**: The marketing landing page.
    *   **Features**: Sticky Navbar, Hero Section, Floating 3D Cards, About Section.
    *   **Role**: Introduces the product and links to the core app.
2.  **`note-file.html`**: The core application.
    *   **Features**:
        *   **Text Editor**: Wiki-style linking using `[[Note Title]]`.
        *   **Graph View**: Visualizes connections between notes.
        *   **AI Assistant**: A chatbot that answers your questions to help you think.
    *   **Architecture**: Designed as a single-file portable app.
3.  **`script.js`**:
    *   **Role**: Handles interaction and smooth scrolling for the Landing Page.
4.  **`style.css`**:
    *   **Role**: Provides the global styling, typography (San Francisco), and theme for the Landing Page.

## Getting Started

1.  **Clone or Download** the repository.
2.  **Open `index.html`** in your web browser to view the Landing Page.
3.  Click **"Launch App"** or **"Get Started"** to open the Note Taking App (`note-file.html`) in a new tab.

## Usage Guide

*   **Creating Notes**: Click "+ New Note" in the sidebar.
*   **Linking**: Type `[[` followed by the title of another note to create a link.
*   **Graph View**: Click the "Graph View" toggle to see your note network.
*   **AI Chat**: Click the floating robot icon to ask questions. (Note: The AI currently ignores note content to focus on unbiased questioning).
