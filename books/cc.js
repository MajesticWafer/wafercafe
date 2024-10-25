// cc.js, cookie clicker cheats bookmarklet
javascript:(function(){
  let categories = {
    "Cookies": {
      1: { name: "Earn Cookies", action: () => { let amount = prompt("Enter the amount of cookies to earn:"); Game.Earn(parseInt(amount)); } },
      2: { name: "Set Total Cookies", action: () => { let amount = prompt("Enter the total cookies to set:"); Game.cookies = parseInt(amount); } },
      3: { name: "Add Cookies to Total", action: () => { let amount = prompt("Enter the amount of cookies to add:"); Game.cookies += parseInt(amount); } },
      4: { name: "Set Cookies per Second", action: () => { let cps = prompt("Enter the cookies per second (CPS):"); Game.cookiesPs = parseInt(cps); } }
    },
    "Game Settings": {
      1: { name: "Ascend", action: () => Game.Ascend(1) },
      2: { name: "Change Ascend Timer", action: () => { let time = prompt("Enter the new Ascend Timer:"); Game.AscendTimer = parseInt(time); } },
      3: { name: "Set Bakery Name", action: () => { let name = prompt("Enter your bakery's name:"); Game.bakeryName = name; Game.bakeryNameRefresh(); } },
      4: { name: "Build Ascend Tree", action: () => Game.BuildAscendTree() },
      5: { name: "Set Buy Bulk", action: () => { let bulk = prompt("Enter buy bulk (1, 10, or 100):"); Game.buyBulk = parseInt(bulk); } },
      6: { name: "Calculate Gains", action: () => Game.CalculateGains() },
      7: { name: "Set Dragon Level", action: () => { let level = prompt("Enter dragon level:"); Game.dragonLevel = parseInt(level); } },
      8: { name: "Set Santa Level", action: () => { let level = prompt("Enter santa level:"); Game.santaLevel = parseInt(level); } }
    },
    "Achievements and Upgrades": {
      1: { name: "Unlock Achievement", action: () => { let name = prompt("Enter achievement name:"); Game.Win(name); } },
      2: { name: "Check Achievement", action: () => { let name = prompt("Enter achievement name to check:"); alert(Game.Has(name)); } },
      3: { name: "Gain Sugar Lumps", action: () => { let lumps = prompt("Enter the number of sugar lumps:"); Game.gainLumps(parseInt(lumps)); } },
      4: { name: "Unlock All Achievements", action: () => Game.SetAllAchievs(1) },
      5: { name: "Get All Upgrades", action: () => Game.SetAllUpgrade(1) },
      6: { name: "Unlock Everything", action: () => Game.RuinTheFun(1) }
    },
    "Debug": {
      1: { name: "Toggle Debug Prestige", action: () => { Game.DebuggingPrestige = !Game.DebuggingPrestige; alert("Debugging Prestige: " + Game.DebuggingPrestige); } },
      2: { name: "Toggle Debug Timers", action: () => { let on = prompt("Turn debug timers on (1) or off (0):"); Game.debugTimersOn = parseInt(on); } },
      3: { name: "Debug Upgrade CpS", action: () => Game.DebugUpgradeCpS() },
      4: { name: "Get All Debugs", action: () => Game.GetAllDebugs() },
      5: { name: "Hard Reset Game", action: () => { if(confirm("Are you sure you want to hard reset?")) Game.HardReset(2); } }
    }
  };

  let categoryNames = Object.keys(categories).map((cat, i) => `${i+1}: ${cat}`).join("\n");
  let selectedCategory = prompt("Choose a category:\n" + categoryNames);
  let category = categories[Object.keys(categories)[parseInt(selectedCategory) - 1]];

  if (category) {
    let cheatList = Object.entries(category)
      .map(([key, value]) => `${key}: ${value.name}`)
      .join("\n");

    let cheat = prompt("Choose a cheat:\n" + cheatList).toLowerCase();

    if (category[cheat]) category[cheat].action();
    else alert("Cheat not recognized.");
  } else {
    alert("Category not recognized.");
  }
})();
