import { world } from "@minecraft/server";

world.afterEvents.entityHurt.subscribe((event) => {
  const mob = event.hurtEntity;
  if (mob.typeId !== "aop:minotaur") return;

  const health = mob.getComponent("minecraft:health");
  if (!health || health.currentValue <= 0) return;

  const ratio = health.currentValue / health.effectiveMax;

  if (ratio <= 0.5 && !mob.hasTag("raged") && mob.hasTag("mad")) {
    mob.addTag("raged");
    mob.addEffect("strength", 600, { amplifier: 2 });
    mob.addEffect("speed", 600, { amplifier: 2 });
    world.sendMessage("§cThe Minotaur is enraged!");
  }
  if (ratio <= 0.9 && !mob.hasTag("mad")) {
    mob.addTag("mad");
    mob.addEffect("strength", 600, { amplifier: 1 });
    mob.addEffect("speed", 600, { amplifier: 1 });
    world.sendMessage("§cThe Minotaur is getting angry...");
  }
});
