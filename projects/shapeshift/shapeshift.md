
ShapeShift Playground is designed to make graphic and motion design accessible and enjoyable for all. Beyond just drawing, you can use it to construct personalized calculators or simulate mathematical function graphs, expanding the realms of design and calculation to suit your creative needs.

## To Run the Code
- Include CMU Graphics in the file 
    - [What is CMU Graphic?↗](https://academy.cs.cmu.edu/desktop)
- Then run the main.py

## Features
→ Components
- 🔷 Geometry: Circle, Rectangle
- 🔢 Math: Slider 1D, Slider 2D, Add, Subtract, Multiply, Divide, Square, Square Root, Pi, Absolute
- ➡️ Vector: Point, Vector, VectorPreview
- 🔄 Manipulation: Move
- 🧐 Analyze: Panel, Distance

🏗 more under construction...

→ Interaction
- Drag & drop to create components
- Drag wiring node connections
- Multi-select and group movement
- Double-click deletion

→ Interface
- Component categories
- Display toggles
- Grid and axis system
- Realtime canvas

→ Technical Design
- One-way data flow, responsive broadcasting from upper flow to lower
- Component inheritance hierarchy
- Event-driven interaction
- World coordinate system
- Standardized data presentation and propagation

→ Keyboard Shortcuts
| Key | Action                  |
|-----|-------------------------|
| S   | Create Slider1D         |
| C   | Create Circle           |
| R   | Create Rectangle        |
| P   | Create Point            |
| 2   | Create Slider2D         |
| V   | Create Vector           |
| M   | Move                    |
| D   | Distance                |




## Tech log
**Pre-TP0 Accomplishments**  
  - Initial progress on TP ideation and design proposal submission.

<br>

**TP0 (11/18) Accomplishments**  
  - **Core Features**  
    - Component Management:  
      - Create components via toolbar/keyboard shortcuts.  
      - Drag-and-drop, delete, multi-select, and group movement.  
    - Data Flow System:  
      - One-way data flow with default input values, type checking, and automatic propagation.  
    - Component Types:  
      - Geometric (CircleCreator, RectCreator, Point).  
      - Mathematical (UnaryOperator, BinaryOperator, Slider).  
      - Vector (Vector, VectorPreview).  
      - Manipulation (Move).  
    - UI Features:  
      - Toggle displays (axis, grid, dots, guidebook).  
      - Toolbar with category tabs, component previews, and visual feedback.  
    - Technical Notes:  
      - Module dependencies need reorganization. 

<br>


**TP1 (11/25) Notes & Goals**  
  - **Feedback from TP0**:  
    - Improve component complexity (e.g., vector analysis, sliders for shape control).  
    - Fix bugs and redesign workspace layout (design area at canvas bottom).  
  - **Goals for TP2**:  
    - Implement error system.  
    - Expand component library.  
    - Add file load/management.  
    - Optional: Richer data structures in data flow. 

<br>


**TP2 (12/2) Accomplishments**  
  - **New Features**:  
    - Components:  
      - Series, 2D Slider, Panel, Distance.  
      - Enhanced sliders with pinning, nicknames, and precision control.  
      - Toggle visibility for intermediate geometries.  
    - Technical Redesign:  
      - Data representation shifted to 2D lists (supporting multiple geometries/values).  
  - **Challenges**:  
    - Debugging pinned sliders and managing 2D list communication between components.  
  - **Goals for TP3**:  
    - Error system implementation.  
    - Optional: 2D slider recording/playback for animations.  
    - Code cleanup and organization.  

<br>

**TP3 (12/6) Final Features**  
  - **General Features**:  
    - World coordinate system for intuitive drawing.  
    - Drag-and-drop component creation.  
    - Right-side panel for grid/axis toggles and text hints.  
    - Node-based wiring with error detection (red connections + hints).  
    - One-way data flow with default values and multi-geometry support.  
    - Floating component information boxes on hover.  
  - **Key Components**:  
    - Sliders (1D/2D):  
      - Customizable boundaries, nicknames, precision, and pinning.  
      - 2D slider recording/playback for animations.  
    - Panel: Displays real-time output data for transparency.  
  - **Component Class Hierarchy**:  
    - Base `Component` class with subclasses:  
      - `TypicleComponent` (Point, Vector, Operators, Series).  
      - `Slider` hierarchy (1D/2D Base/Pinned variants).  
      - `Panel` for data visualization.  

