import type { Entity } from "@hellhub-collective/sdk";

export default function output(data: Entity | Array<Entity>, pretty = true) {
  console.log(JSON.stringify(data, null, pretty ? 1 : 0));
}
