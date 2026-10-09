import { world, system } from "@minecraft/server";

let instanceTick = 0;

world.sendMessage("Minotaur mod loaded!");

function mainTick() {
  if (instanceTick % 100 === 0) {
    world.sendMessage("Minotaur mod tick: " + instanceTick);
  }

  instanceTick++;
}

system.runInterval(mainTick);