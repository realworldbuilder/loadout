// Brand database extracted from fitness categories
// Excludes exercises, influencers, and gym chains as requested

const bf = (brandId: string) =>
  `https://cdn.brandfetch.io/${brandId}/w/400/h/400/theme/dark/icon.jpeg`;

export interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  url: string;
  category: 'apparel' | 'supplements' | 'energy-drinks' | 'protein-bars' | 'gym-shoes';
}

export const FITNESS_BRANDS: Brand[] = [
  // Gym Apparel
  { id: 'gymshark', name: 'Gymshark', logoUrl: bf('idm2qgZM-w'), url: 'https://gymshark.com', category: 'apparel' },
  { id: 'youngla', name: 'YoungLA', logoUrl: bf('idHdc2miof'), url: 'https://youngla.com', category: 'apparel' },
  { id: 'alphalete', name: 'Alphalete', logoUrl: bf('idt_lIytzb'), url: 'https://alphaleteathletics.com', category: 'apparel' },
  { id: 'darc-sport', name: 'Darc Sport', logoUrl: bf('id39XINMHV'), url: 'https://darcsport.com', category: 'apparel' },
  { id: 'oner-active', name: 'Oner Active', logoUrl: bf('idOJBfvee0'), url: 'https://oneractive.com', category: 'apparel' },
  { id: 'nvgtn', name: 'NVGTN', logoUrl: bf('idmocyzRPj'), url: 'https://nvgtn.com', category: 'apparel' },
  { id: 'buffbunny', name: 'Buffbunny', logoUrl: bf('idn6F4ZDsM'), url: 'https://buffbunny.com', category: 'apparel' },
  { id: 'lululemon', name: 'lululemon', logoUrl: bf('idPjBRPVWS'), url: 'https://lululemon.com', category: 'apparel' },
  { id: 'vuori', name: 'Vuori', logoUrl: bf('idCoBHZ2C0'), url: 'https://vuoriclothing.com', category: 'apparel' },
  { id: 'nike', name: 'Nike', logoUrl: bf('id_0dwKPKT'), url: 'https://nike.com', category: 'apparel' },
  { id: 'dfyne', name: 'DFYNE', logoUrl: bf('idtjLp_VYk'), url: 'https://dfyne.com', category: 'apparel' },
  { id: 'fabletics', name: 'Fabletics', logoUrl: bf('idwYE-y42K'), url: 'https://fabletics.com', category: 'apparel' },
  { id: 'alo-yoga', name: 'Alo Yoga', logoUrl: bf('ide6WhLtKC'), url: 'https://aloyoga.com', category: 'apparel' },
  { id: 'nobull', name: 'NOBULL', logoUrl: bf('idzM66VVpw'), url: 'https://nobullproject.com', category: 'apparel' },
  { id: 'under-armour', name: 'Under Armour', logoUrl: bf('idu8xi0DFE'), url: 'https://underarmour.com', category: 'apparel' },
  { id: 'set-active', name: 'SET ACTIVE', logoUrl: bf('id_alz5gL_'), url: 'https://setactive.com', category: 'apparel' },
  { id: 'ptula', name: 'PTULA', logoUrl: bf('idySlY1sRS'), url: 'https://ptula.com', category: 'apparel' },
  { id: 'botee', name: 'Bo+Tee', logoUrl: bf('idlntvk1il'), url: 'https://boandtee.com', category: 'apparel' },
  { id: 'puma', name: 'PUMA', logoUrl: bf('idDV9AjI6R'), url: 'https://puma.com', category: 'apparel' },
  { id: 'adidas', name: 'adidas', logoUrl: bf('idyqQWKFVE'), url: 'https://adidas.com', category: 'apparel' },

  // Supplements
  { id: 'gorilla-mode', name: 'Gorilla Mind', logoUrl: bf('idOUW3W0RF'), url: 'https://gorillamind.com', category: 'supplements' },
  { id: 'total-war', name: 'REDCON1', logoUrl: bf('idflo2qGrI'), url: 'https://redcon1.com', category: 'supplements' },
  { id: 'bucked-up', name: 'Bucked Up', logoUrl: bf('id6itHK-SF'), url: 'https://buckedup.com', category: 'supplements' },
  { id: 'c4', name: 'C4 Energy', logoUrl: bf('idO0FO3NCo'), url: 'https://cellucor.com', category: 'supplements' },
  { id: 'transparent-labs', name: 'Transparent Labs', logoUrl: bf('idFod0y-jJ'), url: 'https://transparentlabs.com', category: 'supplements' },
  { id: 'ryse', name: 'RYSE', logoUrl: bf('idXKaSU2qc'), url: 'https://rysesupplements.com', category: 'supplements' },
  { id: 'raw-nutrition', name: 'Raw Nutrition', logoUrl: bf('idiwyW79a_'), url: 'https://getrawnutrition.com', category: 'supplements' },
  { id: 'bloom', name: 'Bloom Nutrition', logoUrl: bf('idZJgxJOSV'), url: 'https://bloomnu.com', category: 'supplements' },
  { id: 'alani-nu', name: 'Alani Nu', logoUrl: bf('idlkk5tKea'), url: 'https://alaninu.com', category: 'supplements' },
  { id: '1st-phorm', name: '1st Phorm', logoUrl: bf('idaER50trU'), url: 'https://1stphorm.com', category: 'supplements' },
  { id: 'celsius-supp', name: 'CELSIUS', logoUrl: bf('id_cHpgHRY'), url: 'https://celsius.com', category: 'supplements' },
  { id: 'myprotein', name: 'Myprotein', logoUrl: bf('id9V60az2k'), url: 'https://myprotein.com', category: 'supplements' },
  { id: 'optimum-nutrition', name: 'Optimum Nutrition', logoUrl: bf('idYBgD5cKw'), url: 'https://optimumnutrition.com', category: 'supplements' },
  { id: 'muscletech', name: 'MuscleTech', logoUrl: bf('idBkPP8ZCu'), url: 'https://muscletech.com', category: 'supplements' },
  { id: 'dymatize', name: 'Dymatize', logoUrl: bf('idVsYyiqH-'), url: 'https://dymatize.com', category: 'supplements' },
  { id: 'huge-supplements', name: 'Huge Supplements', logoUrl: bf('idZiqeYggz'), url: 'https://hugesupplements.com', category: 'supplements' },
  { id: 'jacked-factory', name: 'Jacked Factory', logoUrl: bf('idZs3GOBnp'), url: 'https://jackedfactory.com', category: 'supplements' },
  { id: 'morphogen', name: 'Morphogen', logoUrl: bf('idmrhPG7EI'), url: 'https://morphogennutrition.com', category: 'supplements' },
  { id: 'muscle-milk', name: 'Muscle Milk', logoUrl: bf('idxegzBjAW'), url: 'https://musclemilk.com', category: 'supplements' },
  { id: 'rule-one', name: 'Rule One', logoUrl: bf('idufz-Dt0p'), url: 'https://ruleoneproteins.com', category: 'supplements' },

  // Energy Drinks
  { id: 'celsius', name: 'CELSIUS', logoUrl: bf('id_cHpgHRY'), url: 'https://celsius.com', category: 'energy-drinks' },
  { id: 'ghost-energy', name: 'Ghost Energy', logoUrl: bf('id9q10t_4q'), url: 'https://ghostenergy.com', category: 'energy-drinks' },
  { id: 'monster', name: 'Monster Energy', logoUrl: bf('id7YmyJiwi'), url: 'https://monsterbevcorp.com', category: 'energy-drinks' },
  { id: 'reign', name: 'Reign', logoUrl: bf('idaweN-aAH'), url: 'https://reignbodyfuel.com', category: 'energy-drinks' },
  { id: 'bang-energy', name: 'Bang Energy', logoUrl: bf('idDYqkRqO8'), url: 'https://bangenergy.com', category: 'energy-drinks' },
  { id: 'alani-nu-energy', name: 'Alani Nu Energy', logoUrl: bf('idlkk5tKea'), url: 'https://alaninu.com', category: 'energy-drinks' },
  { id: '3d-energy', name: '3D Energy', logoUrl: bf('idGXcUGRjR'), url: 'https://3denergy.com', category: 'energy-drinks' },
  { id: 'zoa-energy', name: 'ZOA Energy', logoUrl: bf('id9MjBKIxp'), url: 'https://zoaenergy.com', category: 'energy-drinks' },
  { id: 'prime-energy', name: 'Prime', logoUrl: bf('idsl6X_7VY'), url: 'https://drinkprime.com', category: 'energy-drinks' },
  { id: 'c4-energy', name: 'C4 Energy', logoUrl: bf('idO0FO3NCo'), url: 'https://cellucor.com', category: 'energy-drinks' },
  { id: 'rockstar', name: 'Rockstar', logoUrl: bf('idDC70pV-h'), url: 'https://rockstarenergy.com', category: 'energy-drinks' },
  { id: 'red-bull', name: 'Red Bull', logoUrl: bf('iddByYpFsc'), url: 'https://redbull.com', category: 'energy-drinks' },
  { id: 'ghost-brand', name: 'GHOST Lifestyle', logoUrl: bf('idsxS0sH2O'), url: 'https://ghostlifestyle.com', category: 'energy-drinks' },
  { id: 'bucked-up-energy', name: 'Bucked Up Energy', logoUrl: bf('id6itHK-SF'), url: 'https://buckedup.com', category: 'energy-drinks' },
  { id: 'kill-cliff', name: 'Kill Cliff', logoUrl: bf('idq9oJnFPF'), url: 'https://killcliff.com', category: 'energy-drinks' },

  // Protein Bars
  { id: 'quest', name: 'Quest', logoUrl: bf('idG7pTDTVO'), url: 'https://questnutrition.com', category: 'protein-bars' },
  { id: 'barebells', name: 'Barebells', logoUrl: bf('idsAOeP2aS'), url: 'https://barebells.com', category: 'protein-bars' },
  { id: 'built-bar', name: 'Built Bar', logoUrl: bf('idcdD5QV_A'), url: 'https://builtbar.com', category: 'protein-bars' },
  { id: 'rxbar', name: 'RXBar', logoUrl: bf('idAe_b0Q2G'), url: 'https://rxbar.com', category: 'protein-bars' },
  { id: 'one-bar', name: 'ONE Bar', logoUrl: bf('idumq3KE49'), url: 'https://one1brands.com', category: 'protein-bars' },
  { id: 'fulfil', name: 'Fulfil', logoUrl: bf('idkvlP3h7D'), url: 'https://fulfil.com', category: 'protein-bars' },
  { id: 'perfect-bar', name: 'Perfect Bar', logoUrl: bf('id1hyAwyWO'), url: 'https://perfectsnacks.com', category: 'protein-bars' },
  { id: 'kind', name: 'KIND', logoUrl: bf('id-X_uEUtG'), url: 'https://kindsnacks.com', category: 'protein-bars' },
  { id: 'clif-bar', name: 'Clif Bar', logoUrl: bf('idHMxCJh7A'), url: 'https://clifbar.com', category: 'protein-bars' },
  { id: 'think', name: 'Think!', logoUrl: bf('idZOJUvbuR'), url: 'https://thinkproducts.com', category: 'protein-bars' },
  { id: 'pure-protein', name: 'Pure Protein', logoUrl: bf('idIdPu6Lxx'), url: 'https://pureprotein.com', category: 'protein-bars' },
  { id: 'fitcrunch', name: 'FitCrunch', logoUrl: bf('idPuitwlAK'), url: 'https://fitcrunchbars.com', category: 'protein-bars' },
  { id: 'grenade', name: 'Grenade', logoUrl: bf('idhJxlkW2k'), url: 'https://grenade.com', category: 'protein-bars' },
  { id: 'musclepharm-combat', name: 'MusclePharm Combat', logoUrl: bf('id9dGSDIvf'), url: 'https://musclepharm.com', category: 'protein-bars' },
  { id: 'powerbar', name: 'PowerBar', logoUrl: bf('idiR4WZ284'), url: 'https://powerbar.com', category: 'protein-bars' },

  // Gym Shoes
  { id: 'nike-metcon', name: 'Nike Metcon', logoUrl: bf('id_0dwKPKT'), url: 'https://nike.com', category: 'gym-shoes' },
  { id: 'converse-chuck', name: 'Converse Chuck Taylor', logoUrl: bf('idDFGP8t3W'), url: 'https://converse.com', category: 'gym-shoes' },
  { id: 'adidas-adipower', name: 'adidas Adipower', logoUrl: bf('idyqQWKFVE'), url: 'https://adidas.com', category: 'gym-shoes' },
  { id: 'reebok-nano', name: 'Reebok Nano', logoUrl: bf('idpEk3GaAN'), url: 'https://reebok.com', category: 'gym-shoes' },
  { id: 'nike-romaleos', name: 'Nike Romaleos', logoUrl: bf('id_0dwKPKT'), url: 'https://nike.com', category: 'gym-shoes' },
  { id: 'nobull-trainer', name: 'NOBULL Trainer', logoUrl: bf('idzM66VVpw'), url: 'https://nobullproject.com', category: 'gym-shoes' },
  { id: 'nb-minimus', name: 'New Balance Minimus', logoUrl: bf('idjR6yqXUb'), url: 'https://newbalance.com', category: 'gym-shoes' },
  { id: 'vans-old-skool', name: 'Vans Old Skool', logoUrl: bf('id4pDar7o9'), url: 'https://vans.com', category: 'gym-shoes' },
  { id: 'vivobarefoot', name: 'Vivobarefoot', logoUrl: bf('idH284EQ59'), url: 'https://vivobarefoot.com', category: 'gym-shoes' },
  { id: 'inov8', name: 'Inov-8', logoUrl: bf('id3GObTkox'), url: 'https://inov-8.com', category: 'gym-shoes' },
  { id: 'ua-tribase', name: 'Under Armour TriBase', logoUrl: bf('idu8xi0DFE'), url: 'https://underarmour.com', category: 'gym-shoes' },
  { id: 'puma-fuse', name: 'Puma Fuse', logoUrl: bf('idDV9AjI6R'), url: 'https://puma.com', category: 'gym-shoes' },
  { id: 'tyr', name: 'TYR', logoUrl: bf('idndLPT79a'), url: 'https://tyr.com', category: 'gym-shoes' },
  { id: 'hylete', name: 'Hylete', logoUrl: bf('id2sXSEAxX'), url: 'https://hylete.com', category: 'gym-shoes' },
  { id: 'xero-shoes', name: 'Xero Shoes', logoUrl: bf('idfq6RpVLP'), url: 'https://xeroshoes.com', category: 'gym-shoes' },
];