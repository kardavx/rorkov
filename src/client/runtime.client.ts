import { Flamework } from "@flamework/core";
import items from "shared/configurations/items";

print(items);

Flamework.addPaths("src/client/components");
Flamework.addPaths("src/client/controllers");
Flamework.addPaths("src/shared/components");

Flamework.ignite();
