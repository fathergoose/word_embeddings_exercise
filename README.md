# word_embeddings_exercise

## Setup

`yarn install`

Download this [data](https://nlp.stanford.edu/data/glove.6B.zip). Unzip and place it's contents into a folder called data at the root of the project.

## Running

`npm start <word>`

## Example

```bash
$ npm start computer

Words most similar to "computer":
————————————————————————————————————————————
| Word              |  Cosine Similarity   |
————————————————————————————————————————————
|  computers        |  0.9165044765653498  |
|  software         |  0.8814993634710455  |
|  technology       |  0.8525559133429745  |
|  electronic       |  0.8125868044629014  |
|  internet         |  0.8060455558122076  |
|  computing        |  0.8026036233505298  |
|  devices          |  0.8016185204075194  |
|  digital          |  0.7991792346702773  |
|  applications     |  0.7912740180594211  |
|  pc               |  0.7883159802467161  |
————————————————————————————————————————————
```
