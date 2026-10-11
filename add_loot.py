import nbtlib
from nbtlib import String, Int, List, Compound

PATH = r"behavior_packs\minotaur_mod\structures\aop\minotaur_lair.mcstructure"
LOOT = "loot_tables/chests/minotaur_lair.json"

f = nbtlib.load(PATH, byteorder="little")
root = f.root if hasattr(f, "root") else f

positions = root["structure"]["palette"]["default"]["block_position_data"]
count = 0
for key, data in positions.items():
    bed = data.get("block_entity_data")
    if bed is None:
        continue
    print(f"block {key}: id={bed.get('id')}")
    if str(bed.get("id")) in ("Chest", "Barrel"):
        bed["LootTable"] = String(LOOT)
        bed["LootTableSeed"] = Int(0)
        bed["Items"] = List[Compound]()   # clear any saved items
        count += 1

f.save()
print(f"\nPatched {count} container(s).")