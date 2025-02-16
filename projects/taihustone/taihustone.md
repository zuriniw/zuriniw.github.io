![RO](ROTA.gif)

## Background
Traditional Taihu stone aesthetics emphasize "thinness (瘦), porosity (漏), transparency (透), and wrinkling (皱)" as core qualities. Algorithmic generation of such organic forms faces challenges in balancing parametric control with natural complexity. This project integrates procedural modeling and physical simulation to explore computational reinterpretations of this classical art form.

## Goal and workflow
To develop a parametric tool that dynamically adjusts the four key characteristics of Taihu stones, enabling designers to intuitively explore variations. The workflow combines physics-based point generation (PHYSAREALM) and mesh reconstruction (Chromodoris) to automate form-finding while preserving artistic intent.



## Grasshopper Implementation

<figure>
  <img src="gh.png">
  <figcaption>grasshopper pipeline</figcaption>
</figure>

<figure>
  <img src="init.gif" style="border: 1.6px solid darkgrey;">
  <figcaption>set boundary, food and emit</figcaption>
</figure>

<figure>
  <img src="grow.gif" style="border: 1.6px solid darkgrey;">
  <figcaption>Physarealm Simulation</figcaption>
</figure>
<figure>
  <img src="555.gif" style="border: 1.6px solid darkgrey;">
  <figcaption>processing simulation output</figcaption>
</figure>
<figure>
  <img src="666.gif" style="border: 1.6px solid darkgrey;">
  <figcaption>point to mesh</figcaption>
</figure>
<figure>
  <img src="777.gif" style="border: 1.6px solid darkgrey;">
  <figcaption>mesh optimization</figcaption>
</figure>

<figure>
  <img src="adj.gif" style="border: 1.6px solid darkgrey;">
  <figcaption>parameter tweeking</figcaption>
</figure>


## GUIS

![taihustone.gif](taihustone.gif)
