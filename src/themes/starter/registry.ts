import type { ThemeRegistry } from "@/types"

const starterTheme: ThemeRegistry = {
  key: "starter",
  name: "Starter Theme",
  indonesia: {},
  japan: {},
  layouts: {
    indonesia: null as unknown as ThemeRegistry["layouts"]["indonesia"],
    japan: null as unknown as ThemeRegistry["layouts"]["japan"],
  },
}

export default starterTheme
