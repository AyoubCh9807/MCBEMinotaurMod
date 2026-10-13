import { world, Player, Entity, EntityDamageCause, ItemCooldownComponent, Vector3 } from "@minecraft/server";

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

const SWORD_ID = "oblivion:oblivion_sword";
const RANGE = 20; // blocks
const STEP = 0.5; // space between los particles
const DAMAGE = 6;

world.afterEvents.itemUse.subscribe(({ source: player, itemStack }) => {
  if (itemStack.typeId !== SWORD_ID) return;

  const cd = itemStack.getComponent("minecraft:cooldown") as ItemCooldownComponent | undefined;
  if (!cd) return;
  if (cd.getCooldownTicksRemaining(player) > 0) return;
  cd.startCooldown(player);

  fireBeam(player);
});

function fireBeam(player: Player): void {
  const dim = player.dimension;
  const dir = player.getViewDirection();
  const head = player.getHeadLocation();
  const alreadyHit = new Set<string>();

  for (let d = 1; d <= RANGE; d += STEP) {
    const pos: Vector3 = {
      x: head.x + dir.x * d,
      y: head.y + dir.y * d,
      z: head.z + dir.z * d,
    };

    // stop at solid blocks
    const block = dim.getBlock(pos);
    if (block && !block.isAir && !block.isLiquid) break;

    dim.spawnParticle("minecraft:basic_flame_particle", pos);

    for (const e of dim.getEntities({ location: pos, maxDistance: 1.2 })) {
      if (e.id === player.id || alreadyHit.has(e.id)) continue;
      alreadyHit.add(e.id);
      hit(e, player);
    }
  }

  dim.playSound("mob.blaze.shoot", player.location);
}

function hit(target: Entity, attacker: Player): void {
  target.applyDamage(DAMAGE, {
    cause: EntityDamageCause.fire,
    damagingEntity: attacker,
  });
  target.setOnFire(4, true);
}
