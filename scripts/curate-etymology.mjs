/**
 * Add etymology (name origin) data for all 118 elements.
 * This is standard linguistic/historical knowledge — no scraping.
 * Updates data/final/elements.json in place.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FINAL_DIR = join(__dirname, "..", "data", "final");

const etymology = {
  H: "From Greek 'hydro' (water) + 'genes' (forming) — 'water-former'",
  He: "From Greek 'helios' (sun) — first detected in the solar spectrum",
  Li: "From Greek 'lithos' (stone) — discovered in mineral ore",
  Be: "From the mineral beryl, ultimately from Greek 'beryllos'",
  B: "From Arabic 'buraq' or Persian 'burah' (borax)",
  C: "From Latin 'carbo' (charcoal, coal)",
  N: "From Greek 'nitron' (native soda) + 'genes' (forming)",
  O: "From Greek 'oxys' (sharp, acid) + 'genes' (forming) — 'acid-former'",
  F: "From Latin 'fluere' (to flow) — used as a flux in smelting",
  Ne: "From Greek 'neos' (new)",
  Na: "Symbol from Latin 'natrium'; name from English 'soda' via Arabic 'suda' (headache, from its remedy)",
  Mg: "From Magnesia, a district in Thessaly, Greece",
  Al: "From Latin 'alumen' (alum), a bitter salt",
  Si: "From Latin 'silex' (flint, hard stone)",
  P: "From Greek 'phosphoros' (light-bearer) — glows in the dark",
  S: "From Sanskrit 'sulvere' or Latin 'sulphurium'",
  Cl: "From Greek 'chloros' (pale green) — color of the gas",
  Ar: "From Greek 'argon' (idle, lazy) — chemically inert",
  K: "Symbol from Latin 'kalium' (potash); name from English 'potash' (pot ashes)",
  Ca: "From Latin 'calx' (lime, limestone)",
  Sc: "From Latin 'Scandia' (Scandinavia)",
  Ti: "From the Titans of Greek mythology",
  V: "From Vanadis, a name of the Norse goddess Freyja",
  Cr: "From Greek 'chroma' (color) — forms many colored compounds",
  Mn: "From Latin 'magnes' (magnet), confused historically with magnetite",
  Fe: "Symbol from Latin 'ferrum' (iron); English name from Old English 'iren'",
  Co: "From German 'Kobold' (goblin) — miners blamed cobalt ores for poisoning",
  Ni: "From German 'Kupfernickel' (devil's copper) — deceptive copper-colored ore",
  Cu: "Symbol from Latin 'cuprum', from Cyprus where it was mined; English from Old English 'coper'",
  Zn: "From German 'Zinke' (prong, tooth) — shape of the crystals",
  Ga: "From Latin 'Gallia' (France) — homeland of its discoverer",
  Ge: "From Latin 'Germania' (Germany)",
  As: "From Greek 'arsenikon' (yellow pigment), from Syriac 'zarniqa'",
  Se: "From Greek 'selene' (moon) — counterpart to tellurium (earth)",
  Br: "From Greek 'bromos' (stench) — pungent vapor",
  Kr: "From Greek 'kryptos' (hidden) — difficult to isolate",
  Rb: "From Latin 'rubidus' (dark red) — color of its spectral lines",
  Sr: "From Strontian, a village in Scotland where the mineral was found",
  Y: "From Ytterby, a village in Sweden (source of 4 element names)",
  Zr: "From the mineral zircon, from Arabic 'zargun' (gold-colored)",
  Nb: "From Niobe, daughter of Tantalus in Greek mythology",
  Mo: "From Greek 'molybdos' (lead) — its ore was confused with lead ore",
  Tc: "From Greek 'technetos' (artificial) — first element made artificially",
  Ru: "From Latin 'Ruthenia' (Russia)",
  Rh: "From Greek 'rhodon' (rose) — color of its salts",
  Pd: "From the asteroid Pallas, itself named after the goddess Athena",
  Ag: "Symbol from Latin 'argentum' (shiny, white); English from Old English 'seolfor'",
  Cd: "From Latin 'cadmia' (calamine), from Greek 'kadmeia' (Cadmean earth)",
  In: "From the indigo-blue spectral line that led to its discovery",
  Sn: "Symbol from Latin 'stannum' (tin); English from Old English 'tin'",
  Sb: "Symbol from Latin 'stibium'; name from Greek 'anti + monos' (not alone)",
  Te: "From Latin 'tellus' (earth) — found in the earth",
  I: "From Greek 'iodes' (violet) — color of its vapor",
  Xe: "From Greek 'xenos' (strange, foreign)",
  Cs: "From Latin 'caesius' (sky blue) — color of its spectral lines",
  Ba: "From Greek 'barys' (heavy) — high density of its ores",
  La: "From Greek 'lanthanein' (to lie hidden) — was hidden in cerium ore",
  Ce: "From the dwarf planet Ceres, itself named for the Roman goddess of agriculture",
  Pr: "From Greek 'prasios didymos' (green twin) — green salts, twin of neodymium",
  Nd: "From Greek 'neos didymos' (new twin) — separated from praseodymium",
  Pm: "From Prometheus, the Titan who brought fire to humanity",
  Sm: "From the mineral samarskite, named after Russian mining official Vasili Samarsky-Bykhovets",
  Eu: "From Europe",
  Gd: "From Johan Gadolin, Finnish chemist and discoverer of yttrium",
  Tb: "From Ytterby, Sweden (second of four elements named after this village)",
  Dy: "From Greek 'dysprositos' (hard to get at) — difficult to isolate",
  Ho: "From Latin 'Holmia' (Stockholm)",
  Er: "From Ytterby, Sweden (third of four elements)",
  Tm: "From Thule, an ancient name for Scandinavia",
  Yb: "From Ytterby, Sweden (fourth of four elements)",
  Lu: "From Latin 'Lutetia' (Paris)",
  Hf: "From Latin 'Hafnia' (Copenhagen)",
  Ta: "From Tantalus in Greek mythology — tantalizing difficulty in dissolving",
  W: "Symbol from 'Wolfram' (German); name from Swedish 'tung sten' (heavy stone)",
  Re: "From Latin 'Rhenus' (Rhine river, Germany)",
  Os: "From Greek 'osme' (smell) — its tetroxide has a strong odor",
  Ir: "From Greek 'iris' (rainbow) — its salts are highly colored",
  Pt: "From Spanish 'platina' (little silver) — found in Colombian silver mines",
  Au: "Symbol from Latin 'aurum' (gold, shining dawn); English from Old English 'gold'",
  Hg: "Symbol from Latin 'hydrargyrum' (liquid silver); named after the planet Mercury",
  Tl: "From Greek 'thallos' (green shoot) — bright green spectral line",
  Pb: "Symbol from Latin 'plumbum' (lead); English from Old English 'lead'",
  Bi: "From German 'Wismut', possibly from 'weisse Masse' (white mass)",
  Po: "From Latin 'Polonia' (Poland) — homeland of Marie Curie",
  At: "From Greek 'astatos' (unstable)",
  Rn: "From radium, its parent element — 'radium emanation'",
  Fr: "From France — discovered at the Curie Institute in Paris",
  Ra: "From Latin 'radius' (ray) — its intense radioactivity",
  Ac: "From Greek 'aktinos' (ray) — radioactive",
  Th: "From Thor, Norse god of thunder",
  Pa: "From Greek 'protos' + 'aktinos' (first ray) — decays into actinium",
  U: "From the planet Uranus, discovered 8 years prior",
  Np: "From the planet Neptune, next after Uranus",
  Pu: "From the dwarf planet Pluto, next after Neptune",
  Am: "From the Americas, by analogy with europium (Europe)",
  Cm: "From Marie and Pierre Curie, pioneers of radioactivity research",
  Bk: "From Berkeley, California, where it was synthesized",
  Cf: "From California and the University of California",
  Es: "From Albert Einstein",
  Fm: "From Enrico Fermi, architect of the nuclear age",
  Md: "From Dmitri Mendeleev, creator of the periodic table",
  No: "From Alfred Nobel, inventor of dynamite and founder of the Nobel Prizes",
  Lr: "From Ernest Lawrence, inventor of the cyclotron",
  Rf: "From Ernest Rutherford, father of nuclear physics",
  Db: "From Dubna, Russia, home of the Joint Institute for Nuclear Research",
  Sg: "From Glenn T. Seaborg, discoverer of 10 transuranium elements",
  Bh: "From Niels Bohr, pioneer of atomic structure",
  Hs: "From Hesse, Germany, where it was synthesized",
  Mt: "From Lise Meitner, co-discoverer of nuclear fission",
  Ds: "From Darmstadt, Germany, location of GSI laboratory",
  Rg: "From Wilhelm Röntgen, discoverer of X-rays",
  Cn: "From Nicolaus Copernicus, who proposed the heliocentric model",
  Nh: "From Nihon (Japan) — first element discovered in Asia",
  Fl: "From Flerov Laboratory in Dubna, named after Georgy Flyorov",
  Mc: "From Moscow Oblast, Russia",
  Lv: "From Lawrence Livermore National Laboratory, California",
  Ts: "From Tennessee, home of Oak Ridge National Laboratory",
  Og: "From Yuri Oganessian, pioneering nuclear physicist, only living person with a named element",
};

// Load and update elements
const elementsPath = join(FINAL_DIR, "elements.json");
const elements = JSON.parse(readFileSync(elementsPath, "utf8"));

let updated = 0;
for (const el of elements) {
  const etym = etymology[el.symbol];
  if (etym) {
    el.name_origin = etym;
    updated++;
  }
}

writeFileSync(elementsPath, JSON.stringify(elements, null, 2));
console.log(`Etymology added for ${updated}/118 elements`);
