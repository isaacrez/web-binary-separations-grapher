/*
Antoine's Coeffiecents:
https://en.wikipedia.org/wiki/Antoine_equation

Used to estimate vapor pressure from temperature, or temperature from vapor
pressure, within a limited range

Pressure:     log10(p) = A - B / (C + T)
Temperature:  T = B / (A - log10(p)) - C

Units used: Kelvin, mmHg
*/

export const chemicals = {
  'water': [18.3036, 3816.44,  -46.13],
  'n-butane': [15.6782,2154.90,-34.42],
  'n-pentane': [15.8333,2477.07,-39.94],
  'n-hexane': [15.8366,2697.55,-48.78],
  'n-heptane': [15.8737,2911.32,-56.51],
  'n-octane': [15.9426,3120.29,-63.63],
  'n-nonane': [15.9671,3291.45,-71.33],
  'n-decane': [16.0114,3456.80,-78.67],
  'n-hexadecane': [16.1841,4214.91,-118.70],
  'benzene': [15.9008,2788.51,-52.36],
  'toluene': [16.0137,3096.52,-53.67],
  'ethylbenzene': [16.0195,3279.47,-59.95],
  '1-propylbenzene': [16.0062,3433.84,-66.01],
  '1-butylbenzene': [16.0793,3633.40,-71.77],
  'methanol': [18.5875,3626.55,-34.29],
  'ethanol':	[18.9119,3803.98,-41.68],
  '1-propanol': [17.5439,3166.38,-80.15],
  '1-butanol': [17.2160,3137.02,-94.43],
  '1-pentanol': [16.5270,3026.89,-105.00],
  '1-octanol': [15.7428,3017.81,-137.10],
  '1-lacticacid': [16.0785,4276.57,-91.00],
  'l-lactide': [19.6150,7279.91,0.00]
}
