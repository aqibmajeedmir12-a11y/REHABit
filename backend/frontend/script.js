const ACHIEVEMENTS = [
  {
    id:"streak_3",
    name:"Getting Started",
    desc:"Reach a 3-day streak",
    streak:3,
    xp:50,
    level:"Silver",
    icon:"🥈"
  },
  {
    id:"streak_7",
    name:"Consistency Champ",
    desc:"Reach a 7-day streak",
    streak:7,
    xp:120,
    level:"Gold",
    icon:"🥇"
  },
  {
    id:"streak_30",
    name:"Habit Master",
    desc:"Reach a 30-day streak",
    streak:30,
    xp:300,
    level:"Platinum",
    icon:"💎"
  }
];

function celebrateUnlock(){
  confetti({
    particleCount:120,
    spread:70,
    origin:{y:0.6}
  });
}

