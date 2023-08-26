import { Flamework } from "@flamework/core";
import { configs } from "shared/configurations/items";

print(configs);

Flamework.addPaths("src/client/components");
Flamework.addPaths("src/client/controllers");
Flamework.addPaths("src/shared/components");

Flamework.ignite();
