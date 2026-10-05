# Choice Story

A small story in three stages. At each stage something is in the way and there are two tools to choose from; one of them helps. Written
for children as much as anyone: the words are plain and friendly and the worst that ever happens is a splash, a boing or a flump.

## Rules

- Each **level** is one story of three **stages**. A stage shows what is in the way (rain, a muddy puddle, a locked door, a dark cave...), the character, and two tools to tap.
- Tap the **right tool**: a little animation shows it working (the rain stops, the door opens, a bridge goes across) and the next stage begins. After the third the story is won.
- Tap the **wrong tool**: it plays a harmless failure (the character sees stars, the tool wobbles) and a message says why it did not help. The stage is then tried again:
  press **Try again**. The slips are counted, and the story ends with three stars if there were none.
- **Restart** (the button below the board) starts the whole story again.

There is no clock and no way to run out of tries.

## Levels

Four stories (a story is a level), twelve stages in all, each with a different problem and a different pair of tools. The right tool is on the left in some stages and on the right in others.

| Level | Story | The three stages |
| --- | --- | --- |
| 1 | A Rainy Walk | Rain (umbrella), a muddy puddle (boots), a locked door (key) |
| 2 | Night in the Cave | The dark (torch), a gap in the path (plank), a hungry bear cub (honey) |
| 3 | Snow Day | Deep snow (shovel), a cold wind (scarf), a long hill (sled) |
| 4 | Treasure Island | The sea (raft), where to dig (map), a locked chest (key) |

## What is tested

- Every story has three stages, each with two different tools and exactly one that helps, and the right one is on each side somewhere.
- Every tool and every line of every stage has its words in English and Japanese.
- The right tool at every stage wins the story; the wrong one loses the stage, counts a slip, and the stage can be tried again, as many times as it takes.
- Browser tests play every story through with taps, slip once in each, and finish.
