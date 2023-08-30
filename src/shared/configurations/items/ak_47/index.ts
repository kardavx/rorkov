import { Animations } from "../default/animations";
import { Properties } from "../default/properties";

const requiredAnimations = require(script.FindFirstChild("animations") as ModuleScript) as { default: Animations };
const requiredProperties = require(script.FindFirstChild("properties") as ModuleScript) as { default: Properties };
const requiredItemType = require(script.FindFirstChild("item-type") as ModuleScript) as { default: string };

assert(requiredAnimations !== undefined, "for some reason animations doesnt exist even though required????");
assert(requiredAnimations !== undefined, "for some reason properties doesnt exist even though required????");
assert(requiredItemType !== undefined, "for some reason itemType doesnt exist even though required????");

export const animations = requiredAnimations.default;
export const properties = requiredProperties.default;
export const itemType = requiredItemType.default;
