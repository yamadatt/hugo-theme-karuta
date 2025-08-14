---
title: "Mermaid Diagrams Support"
date: 2024-01-08T16:45:00Z
tags: ["mermaid", "diagrams", "flowchart"]
categories: ["demo"]
---

# Mermaid Diagrams

The Karuta theme includes built-in support for Mermaid diagrams, making it easy to create flowcharts, sequence diagrams, and more.

## Flowchart Example

```mermaid
flowchart TD
    A[Start] --> B{Is Hugo theme?}
    B -->|Yes| C[Use Karuta theme]
    B -->|No| D[Find another theme]
    C --> E[Create beautiful blog]
    D --> F[Keep searching]
    E --> G[Enjoy blogging]
    F --> B
    G --> H[End]
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server
    
    User->>Browser: Enter URL
    Browser->>Server: HTTP Request
    Server-->>Browser: HTML Response
    Browser-->>User: Render Page
    
    Note over User,Server: Hugo generates static sites
```

## Git Flow Diagram

```mermaid
gitgraph
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    commit
    merge develop
    commit
```

## Class Diagram

```mermaid
classDiagram
    class BlogPost {
        +String title
        +Date publishDate
        +String[] tags
        +String content
        +render()
        +getExcerpt()
    }
    
    class Theme {
        +String name
        +String version
        +renderPost(post)
        +applyStyles()
    }
    
    BlogPost --> Theme : uses
```

Mermaid diagrams are rendered beautifully and adapt to the current theme (light/dark mode)!