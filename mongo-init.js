db = db.getSiblingDB('wodbook')

var admin = new ObjectId();

db.users.insertMany([
	{
		"id": "_6IaaR8H6PXPHhAuoniey_vA1bG8W-2M",
		"email": "egillsveinbjorns@gmail.com",
		"password": "clout",
		"admin": true,
		"boxName": "CrossFit Reykjavík",
		"dateOfBirth": "1991-12-06T00:00:00.000Z",
		"height": 189,
		"weight": 920000,
		"firstName": "Egill",
		"lastName": "Sveinbjörnsson",
	},
	{
		"id": "npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx",
		"email": "admin@wodbook.com",
		"password": "admin",
		"admin": true,
		"boxName": "none",
		"dateOfBirth": "2012-12-12T00:00:00.000Z",
		"height": 200,
		"weight": 100000,
		"firstName": "admin",
		"lastName": "",
	}
])

db.workouts.insertMany([
	{
		"id": "CdblHRB-M3LQNgcuSD6idhYWZbmISj5C",
		"name": "Abbate",
		"measurement": "time",
		"description": "For time:\n\nRun 1 mile\n21 Clean and Jerk,\n  155 lbs/105 lbs or 70 kg/47,5 kg\nRun 800 meters\n21 Clean and Jerk,\n  155 lbs/105 lbs or 70 kg/47,5 kg\nRun 1 Mile",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.846Z"
	},
	{
		"id": "5WOvPC4yhJOkhqlPrGrrrkeJvdO2C6yl",
		"name": "Adam Brown",
		"measurement": "time",
		"description": "Two rounds:\n\n24 deadlifts, 295 lbs/200 lbs or\n  130 kg/90 kg\n24 box jumps, 24 inch/20 inch or\n  60 cm/50 cm box\n24 Wallball shots, 20 pound/14 pound ball\n24 bench presses, 195 lbs/125-130\n  lbs or 85 kg/60 kg\n24 box jumps\n24 wallball shots\n24 cleans, 145 lbs/100 lbs or 65\n  kg/45 kg",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.836Z"
	},
	{
		"id": "agSzwN3QBWSpl--mdhTKjptrUdCBIGHO",
		"name": "Andy",
		"measurement": "time",
		"description": "For time, wearing a 20-lb. vest:\n\n25 thrusters, 115 lb./80 lb.\n\n50 box jumps, 24 in./20 in.\n\n75 deadlifts, 115 lb./80 lb.\n\n1.5-mile run\n75 deadlifts, 115 lb./80 lb.\n\n50 box jumps, 24 in./20 in.\n\n25 thrusters, 115 lb./80 lb.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.806Z"
	},
	{
		"id": "pBqicl7TWAeRACnPzynFjV67AN8fFLIU",
		"name": "Arnie",
		"measurement": "time",
		"description": "With a single 2 pood (32 kg) / 1,5 pood (24) kettlebell:\n\n21 turkish get-ups, right arm\n50 swings\n21 overhead squats, left arm\n\n50 swings\n21 overhead squats, right arm\n\n50 swings\n21 turkish get-ups, left arm",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.834Z"
	},
	{
		"id": "QlUguqR1cd7pCcderAT_mWDVGWq4dvAM",
		"name": "Artie",
		"measurement": "repetitions",
		"description": "Complete as many rounds as possible in 20 minutes of:\n\n5 pull-ups\n10 push-ups\n15 squats\n5 pull-ups\n10 thrusters, 95 lb.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.793Z"
	},
	{
		"id": "oC-6MtBZHjaf5C1fDQvOROdw4mfT3AQp",
		"name": "Badger",
		"measurement": "time",
		"description": "3 rounds:\n\n30 squat cleans 95/65 lbs or 42.5/30\n  kg\n\n30 pull-ups\n800 m run",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.825Z"
	},
	{
		"id": "-nGa1R8ZYZfhFXWK6-BiAFV4SdjEXrdG",
		"name": "Bell",
		"measurement": "time",
		"description": "3 rounds for time of:\n\n21 deadlifts, 185 lbs/125 lbs or\n  85 kg/55 kg\n15 pull-ups\n9 Front squats 185 lbs/125 lbs or\n  85 kg/55 kg",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.851Z"
	},
	{
		"id": "COL2Wa3kvjNeU7Os1FO88DXmMLKrYEkv",
		"name": "Blake",
		"measurement": "time",
		"description": "Four rounds:\n\n100 foot/30m walking lunge with 45 lb/35 lb or 20 kg/15 kg plate held\n  overhead\n\n30 box jump, 24 inch/20 inch or 60\n  cm/50 cm box\n20 wallball shots, 20 pound/14 pound ball\n10 handstand push-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.840Z"
	},
	{
		"id": "KU6iYeNcVn6OlptfiEkFAe5Z4bZSR296",
		"name": "Bowen",
		"measurement": "time",
		"description": "3 rounds for time of:\n\nRun 800 meters\n7 Deadlifts, 275 lbs/185 lbs or 125\n  kg/85 kg\n10 burpee pull-ups\n14 (7 per hand). single arm kettlebell thrusters,\n  1,5 pood/ 1 pood or 24 kg/16 kg\n20 box jumps, 24 inch/20 inch or\n  60 cm/50 cm",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.857Z"
	},
	{
		"id": "2KovrVLC0vOamxGhcAX9fNEK6g-1f2xl",
		"name": "Brenton",
		"measurement": "time",
		"description": "Five rounds of:\n\nbear crawl 100 feet/30 m\nstanding broad-jump, 100 feet/30 m\n\nDo three Burpees after every five\nbroad-jumps. If you’ve got a 20/14 pound vest or body armor, wear it.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.840Z"
	},
	{
		"id": "Wgll4JK8piImmRzqPf5JsYf1vJV0ldZt",
		"name": "Bulger",
		"measurement": "time",
		"description": "Ten rounds of:\n\n150 m run\n7 chest to bar pull-ups\n7 front squats, 135 lbs/95 lbs or\n  60 kg/42,5 kg\n7 handstand push-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.839Z"
	},
	{
		"id": "6K2j8Pki4p_AkMKdAebyZBjWLAiklaLZ",
		"name": "Bull",
		"measurement": "time",
		"description": "Two rounds:\n\n200 double-unders\n50 overhead squats, 135 lbs/95 lbs\n  or 60 kg/45 kg\n50 pull-ups\n1 mile run",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.842Z"
	},
	{
		"id": "Emd8kUUxkT9zucykSQLzRHjgvq0R3Sq9",
		"name": "Cameron",
		"measurement": "time",
		"description": "For time:\n\n50 walking lunge\n25 C2B\n50 Box jumps 24''/20''\n  or 60cm/50cm\n25 triple-unders\n50 back extensions\n25 ring dips\n50 K2E\n25 wall ball\n50 sit-ups\n5 rope climbs",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.799Z"
	},
	{
		"id": "Tg3K4C6aMrnBcuJE96SvKasijRNQEGCB",
		"name": "Capoot",
		"measurement": "time",
		"description": "For time:\n\n100 push-ups\nRun 800 meters\n75 push-ups\nRun 1,200 meters\n50 push-ups\nRun 1,600 meters\n25 push-ups\nRun 2,000 meters",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.821Z"
	},
	{
		"id": "WNcdtwEnH9uSxRhb0TWvzg_U5wdiwmnO",
		"name": "Coe",
		"measurement": "time",
		"description": "Ten rounds:\n\n10 thrusters, 95 lbs/65 lbs or 42.5\n  kg/30kg\n10 ring push-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.837Z"
	},
	{
		"id": "j-jSl_iTuP7j7gMs8rb4zipgMxgiFGBL",
		"name": "Coffland",
		"measurement": "time",
		"description": "For time:\nHang from a pull-up bar for 6 minutes\nEach time you drop from the bar, perform: - 800-m run            - 30 push-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.806Z"
	},
	{
		"id": "ap2O0MdGLf6tnnqg2jIVmNe3e3m8wMCn",
		"name": "Crain",
		"measurement": "time",
		"description": "2 rounds for time of:\n\n34 push-ups\n50-yard sprint\n34 deadlifts, 135 lbs/95 lbs or 60\n  kg/45 kg\n50-yard sprint\n34 box jumps, 24 inch/20 inch or\n  60 cm/50 cm\n50-yard sprint\n34 clean and jerks,\n  95 lbs/60 lbs or 45 kg/30 kg\n50-yard sprint\n34 burpees\n50-yard sprint\n34 wall-ball shots, 20 lbs/14 lbs ball\n50-yard sprint\n34 pull-ups\n50-yard sprint",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.857Z"
	},
	{
		"id": "mEaTv8ki7YwlPKZb5Oy4m5FFogMCctB7",
		"name": "D.T. / DT",
		"measurement": "time",
		"description": "Five rounds:\n\n12 deadlifts, 155/105 lbs or 70/50\n  kg\n\n9 hang power cleans, 155/105 lbs\n  or 70/50 kg\n6 push jerks, 155/105 lbs or 70/50\n  kg",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.829Z"
	},
	{
		"id": "7BTLXiAA_91hkRZcVAxQPglOOjkBmWiz",
		"name": "Dallas 5",
		"measurement": "repetitions",
		"description": "5 minutes of:\n\nBurpees\n\nThen, 5 minutes of:\n\n7 deadlifts, 155 lb.\n7 box jumps, 24-in. box\n\nThen, 5 minutes of:\n\nTurkish get-ups, 40-lb. dumbbell\n\nThen, 5 minutes of:\n\n7 snatches, 75 lb.\n7 push-ups\n\nThen, 5 minutes of:\n\nRowing (calories)\n\nComplete as many reps as possible at each 5-minute station. Rest 1 minute\nbetween stations.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.808Z"
	},
	{
		"id": "rf1WoAAap99SOuvTAyIcYJa3TXe3h4vc",
		"name": "Daniel",
		"measurement": "time",
		"description": "50 pull-ups\n400 m run\n21 thrusters, 95/65 lbs or 42.5/30\n  kg\n\n800 m run\n21 thrusters, 95/65 lbs or 42.5/30\n  kg\n\n400 m run\n50 pull-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.823Z"
	},
	{
		"id": "5bpq-oovDIgqBfBvcuvUhzbgrtFSCL5F",
		"name": "Danny",
		"measurement": "repetitions",
		"description": "20 min AMRAP:\n\n30 boxjumps, 24/20 inch or 60/50 cm\n20 push presses, 115/75-85 lbs or\n  50/35 kg\n30 pull-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.830Z"
	},
	{
		"id": "UdggT5nXbqSFA8_93HBctzHa9VvuXKX0",
		"name": "Dunn",
		"measurement": "repetitions",
		"description": "Complete as many rounds as possible in 19 minutes of:\n\n3 muscle-ups\n1 shuttle sprint, 5 yards, 10 yards,\n  15 yards\n6 burpee box jump-overs, 20-in. box\n\n\nOn the burpees, jump over the box\nwithout touching it.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.805Z"
	},
	{
		"id": "Gy8ZbGcMmtWXPGWwZ3ahl3SXPwJkIml4",
		"name": "Emily",
		"measurement": "time",
		"description": "10 rounds for time of:\n\n30 double-unders\n15 pull-ups\n30 squats\n100-m sprint\nRest 2 minutes",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.807Z"
	},
	{
		"id": "FTRkb8JczPKWm0tGiY5CZ4-cYH6sKHnK",
		"name": "Erin",
		"measurement": "time",
		"description": "Five rounds:\n\n15 dumbbell split\n  cleans, 40/25 lbs or 20/15 kg\n21 pull-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.828Z"
	},
	{
		"id": "zIEjm9QM-2wHpRYohuxSOUHVfE9bYhsb",
		"name": "Feeks",
		"measurement": "time",
		"description": "For time:\n\n2 x 100-meter shuttle sprint\n2 squat clean thrusters, 65 lbs/45\n  lbs or 30 kg/20 kg dumbbells\n4 x 100-meter shuttle sprint\n4 squat clean thrusters, 65 lbs/45\n  lbs or 30 kg/20 kg dumbbells\n6 x 100-meter shuttle sprint\n6 squat clean thrusters, 65 lbs/45\n  lbs or 30 kg/20 kg dumbbells\n8 x 100-meter shuttle sprint\n8 squat clean thrusters, 65 lbs/45\n  lbs or 30 kg/20 kg dumbbells\n10 x 100-meter shuttle sprint\n10 squat clean thrusters, 65 lbs/45\n  lbs or 30 kg/20 kg dumbbells\n12 x 100-meter shuttle sprint\n12 squat clean thrusters, 65 lbs/45\n  lbs or 30 kg/20 kg dumbbells\n14 x 100-meter shuttle sprint\n14 squat clean thrusters, 65 lbs/45\n  lbs or 30 kg/20 kg dumbbells\n16 x 100-meter shuttle sprint\n16 squat clean thrusters, 65 lbs/45\n  lbs or 30 kg/20 kg dumbbells",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.853Z"
	},
	{
		"id": "rDSSQ-BA3Pr2DGwtW63eVMb2p2p4hsgZ",
		"name": "Foo",
		"measurement": "time",
		"description": "13 Benc presses, 170 lbs/110 lbs or\n77,5 kg/50 kg\nThen, complete as many rounds as possible in 20 minutes of:\n\n7 chest-to-bar pull-ups\n77 double-unders\n2 Squat clean thrusters, 170 lbs/110\n  lbs or 77,5 kg/50 kg\n28 sit-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.856Z"
	},
	{
		"id": "Myv-a4i879ZGWUfNfBxB4WFKi2Jpu7H5",
		"name": "Forrest",
		"measurement": "time",
		"description": "Three rounds:\n\n20 L-pull-ups\n30 toes to bar\n40 burpees\n800 m run",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.839Z"
	},
	{
		"id": "6wT7Sx8UwAo2lkyU4qTjClNZ4lKaedRc",
		"name": "Garrett",
		"measurement": "time",
		"description": "Three rounds:\n\n75 squats\n25 ring handstand push-ups\n25 L-pull-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.831Z"
	},
	{
		"id": "D0vRaFNu7pgx5SGojwa5GfnT_uR6ucYP",
		"name": "Gaza",
		"measurement": "time",
		"description": "5 rounds for time of:\n\n35 kettlebell swings, 1.5 pood/1\n  pood or 24 kg/16 kg\n30 push-ups\n25 pull-ups\n20 box jumps, 30 inch/24 inch or\n  75 cm/60 cm\n1-mile run",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.857Z"
	},
	{
		"id": "2d2Hgy82GEFmBVOOKPWvyprL8ZhDUsRJ",
		"name": "Glen",
		"measurement": "time",
		"description": "“Glen”- 45 minute cap 30 Clean & Jerks\n(135/95)\n 1 Mile Run 10 Rope Climbs            1 Mile Run 100 Burpees",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.784Z"
	},
	{
		"id": "q-RglbIqnhAwpg1zImbJy7GdfVhowjap",
		"name": "Griff",
		"measurement": "time",
		"description": "800 m run\n400 m run backwards\n800 m run\n400 m run backwards",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.828Z"
	},
	{
		"id": "9Oo85BC67uLFxWvcETFIeUcPgVD7SI2o",
		"name": "Hall",
		"measurement": "time",
		"description": "5 rounds for time of:\n\n225/155lb. cleans, 3 reps\n\n200-meter sprint\n20 kettlebell snatches, 1.5/1 pood\n  or 24/16kg, 10 each arm\nRest 2 minutes",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.819Z"
	},
	{
		"id": "7dkoMa-Fh4b128AeKQq5nWQ92A888kDL",
		"name": "Hammer",
		"measurement": "time",
		"description": "Five rounds of:\n\n5 Power clean, 135 lbs/95 lbs or 6o\n  kg/45 kg\n10 Front squat, 135 lbs/ 95 lbs or\n  6o kg/45 kg\n5 Jerk, 135 lbs/95 lbs or 6o kg/45\n  kg\n\n20 Pull-ups\n\nRest 90 seconds between each round",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.847Z"
	},
	{
		"id": "lrgyNmREJD1eg99aHQxNhTxWqq6vt3sS",
		"name": "Hansen",
		"measurement": "time",
		"description": "Five rounds:\n\n30 kettlebell swings, 2/1.5 pood\n  or 32/24 kg \n30 burpees\n30 glute-ham sit-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.830Z"
	},
	{
		"id": "z7mvmNIVSEHAK39v46odHA2fEDNxTABw",
		"name": "Harper",
		"measurement": "repetitions",
		"description": "Complete as many rounds as possible in 23 minutes of:\n\n9 chest-to-bar pull-ups\n135/95lb. power cleans, 15 reps\n21 squats\n400-meter run with a 45/35lb. plate",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.811Z"
	},
	{
		"id": "HKX_rw1IWuUy28KToLXHfYl-JZNjkPYU",
		"name": "Havana",
		"measurement": "repetitions",
		"description": "Complete as many rounds as possible in 25 minutes of:\n\n150 double-unders\n50 push-ups\n15 power cleans\n\nMen: 185 lb. Women: 125 lb.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.782Z"
	},
	{
		"id": "yRvjOm_LhcQ5ZfXjINpP6z23b9_P8Dtu",
		"name": "Helton",
		"measurement": "time",
		"description": "Three rounds:\n\n800 m run\n30 dumbbell squat\n  cleans, 50 pound/35 pound or 25\n  kg/17,5 kg\n30 burpees",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.838Z"
	},
	{
		"id": "RdJp74qntB_x36xshLA_Rr_-OzSlJOcF",
		"name": "Hildy",
		"measurement": "time",
		"description": "For time:\n\n100-calorie row\n75 thrusters, 45/35lb. barbell\n\n50 pull-ups\n75 wall-ball shots, 20/14lb. ball\n100-calorie row\n\nIf you’ve got a 20/14lb. vest or body armor, wear it.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.808Z"
	},
	{
		"id": "Kbf3RpxKKSqNoD-5M4kp6y7vgSV1A99Q",
		"name": "Holbrook",
		"measurement": "time",
		"description": "Ten rounds of:\n\n5 thrusters, 115 pound/75-80 lbs\n  or 50kg/35 kg\n10 pull-ups\n100 m run\nrest 1 minute",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.843Z"
	},
	{
		"id": "0hXcPpchvoeXjdvlTdLJiRXeInLLx7WS",
		"name": "Hollywood",
		"measurement": "time",
		"description": "For time:\n\nRun 2 km\n22 wall-ball shots, 30-lb. ball\n22 muscle-ups\n22 wall-ball shots, 30-lb. ball\n22 power cleans, 185-lb.\n22 wall-ball shots, 30-lb. ball\nRun 2 km",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.795Z"
	},
	{
		"id": "6vUF5twcAtByTURCwaLbAr14_s_zIQmD",
		"name": "Hortman",
		"measurement": "repetitions",
		"description": "45 minute AMRAP:\n\n800 meter run\n80 Air squats\n8 Muscle ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.817Z"
	},
	{
		"id": "KGlmPRVOTvb7NEn-mkWYNSWhXLfPkwU2",
		"name": "Horton",
		"measurement": "time",
		"description": "9 rounds for time with a partner of:\n\n9 bar muscle-ups\n11 clean and jerks,\n  155/105 lb.\n50-yard buddy carry\n\nShare the work with your partner however you choose with only one person\nworking at a time. If you can't find a partner, perform 5 reps of\neach exercise per round and find a heavy sandbag to carry.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.813Z"
	},
	{
		"id": "amCXS7wB_PtiBwrHYl6lyJxxONhEnvYg",
		"name": "J.J.",
		"measurement": "time",
		"description": "For time:\n\n1 Squat clean 185 lbs/125 lbs \n10 parallette handstand push-ups\n2 Squat clean 185 lbs/125 lbs\n\n9 parallette handstand push-ups\n3 Squat clean 185 lbs/125 lbs\n\n8 parallette handstand push-ups\n4 Squat clean 185 lbs/125 lbs\n\n7 parallette handstand push-ups\n5 Squat clean 185 lbs/125 lbs\n\n6 parallette handstand push-ups\n6 Squat clean 185 lbs/125 lbs\n\n5 parallette handstand push-ups\n7 Squat clean 185 lbs/125 lbs\n\n4 parallette handstand push-ups\n8 Squat clean 185 lbs/125 lbs\n\n3 parallette handstand push-ups\n9 Squat clean 185 lbs/125 lbs\n\n2 parallette handstand push-ups\n10 Squat clean 185 lbs/125 lbs\n\n1 parallette handstand push-up",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.849Z"
	},
	{
		"id": "QswN3TctSWV2JPcfN9a2-4nPqeNQz9e3",
		"name": "JT / J.T.",
		"measurement": "time",
		"description": "21-15-9:\n\nhandstand push-ups\nring dips\npush-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.822Z"
	},
	{
		"id": "Mq3tErsGAKDzhwumQT592-Zsdy8k5jhS",
		"name": "Jack",
		"measurement": "repetitions",
		"description": "20 min AMRAP:\n\n10 push presses, 115 lbs/75-80 lbs\n  50 kg/35 kg\n10 kb swings, 1.5 pood/1 pood or\n  24 kg/16 kg \n10 box jumps, 24 inch/20 inch or\n  60 cm/50 cm",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.838Z"
	},
	{
		"id": "xu3SIgrr-1LiA9kooKxhXiFfsub2wiUf",
		"name": "Jason",
		"measurement": "time",
		"description": "100 squats\n5 muscle-ups\n75 squats\n10 muscle-ups\n50 squats\n15 muscle-ups\n25 squats\n20 muscle-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.824Z"
	},
	{
		"id": "oe_uJRGYZBDI-T7-bliRq_u3JG0u_J-i",
		"name": "Jennifer",
		"measurement": "repetitions",
		"description": "Complete as many rounds as possible in 26 minutes of:\n\n10 pull-ups\n15 kettlebell swings, 1.5/1 pood\n  or 53/35 lbs or 24/16 kg\n20 box jumps, 24/20 inch box",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.814Z"
	},
	{
		"id": "tdVXWUPVu-MrLBDmc3SvxBHQr_HkscJs",
		"name": "Jenny",
		"measurement": "repetitions",
		"description": "Complete as many rounds as possible in 20 minutes of:\n\n20 overhead squats, 45 lbs/35 lbs\n  or 20 kg/15 kg\n20 back squats, 45 lbs/35 lbs or\n  20 kg/15 kg\n400-meter run",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.854Z"
	},
	{
		"id": "DCh2V3ILbwTg27G5qO99fIsBM5XoT9Ss",
		"name": "Jerry",
		"measurement": "time",
		"description": "1 mile run\n2k row\n1 mile run",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.833Z"
	},
	{
		"id": "0_rwNm_ROU-inxI7DBFVMCx28Kj4Jjap",
		"name": "John Rankel",
		"measurement": "repetitions",
		"description": "20 min AMRAP:\n\n6 deadlifts, 225 lbs/155 lbs or 100\n  kg/70 kg\n7 burpee pull-ups\n10 kettlebell swings, 2 pood/1,5\n  pood or 32 kg/24 kg\n200 m run",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.843Z"
	},
	{
		"id": "Plw2iYxfoqk9RCEbbai1xHgpbhtwN1-p",
		"name": "Johnson",
		"measurement": "repetitions",
		"description": "20 min AMRAP:\n\n9 deadlifts, 245 lbs/165 lbs or 110\n  kg/75 kg\n8 muscle-ups\n9 squat cleans, 155 lbs/105 lbs or\n  70 kg/50 kg",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.835Z"
	},
	{
		"id": "-tvru8WFkL-BrjFa_dEBN6lnDhTbn5MT",
		"name": "Josh",
		"measurement": "time",
		"description": "21 overhead squats, 95/65 lbs or\n  42.5/30 kg\n42 pull-ups\n15 overhead squats\n30 pull-ups\n9 overhead squats\n18 pull-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.824Z"
	},
	{
		"id": "fFc6ez2sON5EHuze3j3yEJbDpXougcek",
		"name": "Joshie",
		"measurement": "time",
		"description": "3 rounds:\n\n21 reps dumbbell snatch, right arm,\n  40/30 lbs\n21 L-pull-ups\n21 reps dumbbell snatch, left arm\n\n21 L-Pull-ups\n\nThe snatches are full squat\nsnatches.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.826Z"
	},
	{
		"id": "uLSDPawNs773kHyXsQ8c22eBvF9c52d6",
		"name": "Justin",
		"measurement": "time",
		"description": "30-20-10 reps for time of:\n\nBody-weight back squats\nBody-weight bench presses\nStrict pull-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.850Z"
	},
	{
		"id": "313cmF8pQtuodEwBVvbf5YIF6R1DAPkJ",
		"name": "Kev",
		"measurement": "repetitions",
		"description": "With a partner, complete as many rounds as possible in 26 minutes of:\n\n\n6 deadlifts, 315 lb./205 lb., each\n9 bar-facing burpees, synchronized\n\n9 bar muscle-ups, each\n55-ft. partner barbell carry, 315 lb./205 lb.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.805Z"
	},
	{
		"id": "tIW1JqyRVVdGjzYzTM6BcavOsSky3Ml2",
		"name": "Kevin",
		"measurement": "time",
		"description": "3 rounds for time of:\n\n32 deadlifts, 185 lbs/125 lbs or\n  85 kg/55 kg\n32 hanging hip touches, alternating\n  arms\n800-meter running farmer carry,\n  15 lbs/10 lbs or 7 kg/5 kg dumbbells",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.851Z"
	},
	{
		"id": "-p_Et1RM_-UgtzT0bfgb9Dv-9CAcIYhH",
		"name": "Kutschbach",
		"measurement": "time",
		"description": "7 rounds for time of:\n\n11 back squats, 185/125 lb. \n10 jerks, 135/95 lb.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.814Z"
	},
	{
		"id": "VxDuW9tA9qasnCzWNLQJ8pHavlAN6KXk",
		"name": "Ledesma",
		"measurement": "repetitions",
		"description": "20 min AMRAP:\n\n5 parallette handstand push-ups\n10 toes through rings\n15 medicine ball cleans, 20 pound/14\n  pound",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.843Z"
	},
	{
		"id": "tN9Od66uN0NSXtBLp8ta44Qw1Y7QhJ64",
		"name": "Liam",
		"measurement": "time",
		"description": "For time:\n\nRun 800 meters with a 45-lb / 35-lb.\n  plate\n100 toes-to-bars\n155-lb / 105-lb. front squats, 50\n  reps\n15-ft. rope climbs, 10 ascents\n\nRun 800 meters with a 45-lb / 35-lb\n  plate\n\nPartition the toes-to-bars, front squats\nand rope climbs as needed. Start\nand finish with the run.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.801Z"
	},
	{
		"id": "uEyVLihZBAdFJ5ilZh5TkK0gJNccBn-d",
		"name": "Loredo",
		"measurement": "time",
		"description": "Six rounds for time of:\n\n24 Squats\n24 Push-ups\n24 Walking lunge steps\nRun 400 meters",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.855Z"
	},
	{
		"id": "uGXUlZU6r7lF07EiQ9UFLF7KMYjEO7Nq",
		"name": "Luce",
		"measurement": "time",
		"description": "Wearing a 20/14 pound vest, three rounds of:\n\n1K run\n10 muscle-ups\n100 squats",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.835Z"
	},
	{
		"id": "pOFRqZ9kFNvPtmBmh23WUAB24PCCxSzl",
		"name": "Luke",
		"measurement": "time",
		"description": "For time:\n\nRun 400 meters\n15 Clean and Jerks,\n  155 lbs/105 lbs or 70 kg/47,5 kg\nRun 400 meters\n30 toes-to-bars\nRun 400 meters\n45 wall-ball shots, 20 lbs/14 lbs ball\nRun 400 meters\n45 Kettlebell swings, 1.5-pood/1\n  pood or 24 kg/16 kg\nRun 400 meters\n30 ring dips\nRun 400 meters\n15 Weighted lunges, 155 lbs/105\n  lbs or 70 kg/47,5 kg\nRun 400 meters",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.855Z"
	},
	{
		"id": "xsy37NDS2UXaBwuKL9dY6eASBXZIH_EQ",
		"name": "Lumberjack 20",
		"measurement": "time",
		"description": "20 deadlifts (275/185lbs or 125/85\n  kg)\n\n400 m run\n20 KB swings (2/1.5 pood or 32/24\n  kg)\n\n400 m run\n20 overhead squats (115/75-85lbs\n  or 50/35 kg)\n400 m run\n20 burpees\n400 m run\n20 pull-ups (Chest to Bar)\n400 m run\n20 box jumps (24″/20” or 60/50 cm)\n\n400 m run\n20 DB squat cleans (45/35lbs or 20/15\n  kg each)\n400 m run",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.830Z"
	},
	{
		"id": "nxd9K4mOn3KwFir_PToSj_iQ9Qy_fOtI",
		"name": "Manuel",
		"measurement": "time",
		"description": "5 rounds of:\n\n3 minutes of rope climbs\n2 minutes of squats\n2 minutes of push-ups\n3 minutes to run 400 meters\n\n\nWear a weight vest or body armor. After the run,\nrest for the remainder of the 3 minutes before beginning the next round.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.796Z"
	},
	{
		"id": "IJ8Vrtb4MdkfjmrttdOAjN_bzDX23YMB",
		"name": "Marco",
		"measurement": "time",
		"description": "3 rounds for time of:\n\n21 pull-ups\n15 handstand push-ups\n9 thrusters, 135/95 lb.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.818Z"
	},
	{
		"id": "3numUYCt3DGlRc5Veb6TY5ayak49xFm_",
		"name": "Matt 16",
		"measurement": "time",
		"description": "For time:\n\n16 deadlifts, 275/185 lb. – 16\n  hang power cleans, 185/125 lb.\n16 push presses, 135/95 lb.\n\nRun 800 meters\n16 deadlifts, 275/185 lb.\n16 hang power cleans, 185/125 lb.\n\n16 push presses, 135/95 lb.\n\nRun 800 meters\n16 deadlifts, 275/185 lb.\n16 hang power cleans, 185/125 lb.\n\n16 push presses, 135/95 lb.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.812Z"
	},
	{
		"id": "kcY2fFOOswKghXG8B-WUogeGp4y8n94E",
		"name": "Maupin",
		"measurement": "time",
		"description": "4 rounds for time of:\n\nRun 800 meters\n49 push-ups\n49 sit-ups\n49 squats",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.809Z"
	},
	{
		"id": "MElw2ezbZe0EF6CapKQJZSpEVXsHz-DD",
		"name": "McCluskey",
		"measurement": "time",
		"description": "Three rounds of:\n\n9 Muscle-ups\n15 Burpee pull-ups\n21 Pull-ups\nRun 800 meters",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.844Z"
	},
	{
		"id": "ZOCYztSeYTCiNXEBUKzKcjrBRtJZSBDZ",
		"name": "McGhee",
		"measurement": "repetitions",
		"description": "30 min AMRAP:\n\n5 deadlifts, 275 lbs/185 lbs or 125\n  kg/87,5 kg\n13 push-ups\n9 box jumps, 24 inch/20 inch or 60\n  cm/50cm",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.832Z"
	},
	{
		"id": "qsGzkn1ztFg48rR7TYyYuaTcqRvQLoJr",
		"name": "Michael",
		"measurement": "time",
		"description": "3 rounds:\n\n800 m run\n50 back extensions\n50 sit-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.823Z"
	},
	{
		"id": "MsQDtdgxcYAw5r0N_sX2tyEYNYvMo1Vc",
		"name": "Miron (Mirosław Łucki)",
		"measurement": "time",
		"description": "5 rounds for time of:\n\n800-meter run\n23 back squats, ¾ body weight\n\n13 deadlifts, 1 ½ body weight",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.803Z"
	},
	{
		"id": "JESIaZnczrOQIX-2frYFZYB6W1FcubQf",
		"name": "Moon",
		"measurement": "time",
		"description": "Seven rounds of:\n\n10 Hang split snatch, Right arm,\n  40 lbs/30 lbs dumbbell\n15 ft Rope Climb, 1 ascent\n10 Hang split snatch, Left arm,\n  40 lbs/30 lbs dumbbell\n15 ft Rope Climb, 1 ascent\n\nAlternate feet in the split snatch            sets.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.849Z"
	},
	{
		"id": "7w4EMiA6aLoXAqLl9cn3tg8rzmsgNXO8",
		"name": "Moore",
		"measurement": "repetitions",
		"description": "Complete as many rounds in 20 minutes as you can of:\n\nRope Climb, 1 ascent\nRun 400 meters\nMax rep Handstand push-up\n\nPost the number of handstand push-ups\ncompleted for each round",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.848Z"
	},
	{
		"id": "9C0SYHcVNWccTR0JZUwkBmE5cXBacweC",
		"name": "Mr. Joshua",
		"measurement": "time",
		"description": "Five rounds:\n\n400 m run\n30 glute-ham sit-ups\n15 deadlifts, 250/170 lbs or 115/80.5\n  kg",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.829Z"
	},
	{
		"id": "Aca2xYfz9qbOVoT_W5qU-yEHf4hWHb62",
		"name": "Murph",
		"measurement": "time",
		"description": "1 mile run\n100 pull-ups\n200 push-ups\n300 squats\n1 mile run\n\nPartition the pull-ups, push-ups,\nand squats as needed. Start and finish with a mile run. If you’ve got\na twenty pound vest or body armor, wear it.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.823Z"
	},
	{
		"id": "xgNviB5nPNyCYpcq5A4g8huKRY9A3oJu",
		"name": "Nate",
		"measurement": "repetitions",
		"description": "20 min AMRAP:\n\n2 muscle-ups\n4 handstand push-ups\n8 kettlebell swings, 2/1.5 pood\n  or 32/24 kg",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.826Z"
	},
	{
		"id": "i_gHMuNttxOaLglW4l9gqxQH6nqWLbyf",
		"name": "Ned",
		"measurement": "time",
		"description": "7 rounds for time of:\n\n11 body-weight back squats\n1,000-meter row",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.853Z"
	},
	{
		"id": "Y8H3yalLSorLwQXk5SYKt9BPPDpzC_Th",
		"name": "Nick",
		"measurement": "time",
		"description": "12 rounds for time of:\n\n45-lb. dumbbell hang squat cleans,\n  10 reps\n6 handstand push-ups on dumbbells",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.797Z"
	},
	{
		"id": "N2N1bdsxgB9xGoJDdNgw_A6fKfQSQdrj",
		"name": "Nukes",
		"measurement": "time",
		"description": "8 minutes to complete: 1-mile run            315-lb. deadlifts, max reps\n Then, 10 minutes to complete: 1-mile run            225-lb. power cleans, max reps\n Then, 12 minutes to complete: 1-mile run            135-lb. overhead squats, max reps\nDo not rest between rounds. Post run            times and reps completed for each exercise to comments.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.794Z"
	},
	{
		"id": "X3GYxp00q_1772eZhTD15zOAqWjDWKDa",
		"name": "Nutts",
		"measurement": "time",
		"description": "10 handstand push-ups\n15 deadlifts, 250 lbs/179 lbs or\n  115 kg/80 kg\n25 box jumps, 30 inch/ 24 inch or\n  75 cm/ 60cm\n50 pull-ups\n100 wallball shots, 20/14 pounds\n200 double-unders\n400 m run with a 45lb/35lb plate",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.833Z"
	},
	{
		"id": "wTEV_TisjxamFIHbe3rvWggzpmtV5Ths",
		"name": "Ozzy",
		"measurement": "time",
		"description": "7 rounds for time of:\n\n11 deficit handstand push-ups\n1,000-meter run",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.854Z"
	},
	{
		"id": "-UZOJCdZt_0kay2D7Xs19PBzgLakuSTN",
		"name": "PK / P.K.",
		"measurement": "time",
		"description": "5 rounds for time of:\n\n225/155lb. back squats, 10 reps\n275/185lb. deadlifts, 10 reps\n\n400-meter sprint\nRest 2 minutes",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.817Z"
	},
	{
		"id": "6BpdDF3Wbn5JBWU17DsSQHm2Zmb4tXfG",
		"name": "Pat",
		"measurement": "time",
		"description": "Wearing a 20-lb. / 14-lb. vest, 6 rounds for time:\n\n25 pull-ups\n50-ft. front-rack lunge, 75 lb. / 55-lb.\n25 push-ups\n50-ft. front-rack lunge, 75 lb. / 55-lb.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.803Z"
	},
	{
		"id": "SblLUcbP1nlpegdGh3pe1SYhCCtNDrGB",
		"name": "Paul",
		"measurement": "time",
		"description": "Five rounds:\n\n50 double unders\n35 knees to elbows\n20 yard / 18 m overhead walk, 185 lbs/125 lbs or 85 kg/60 kg",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.832Z"
	},
	{
		"id": "PBZx3FsHEP8GaGgClluNaDMP-g425617",
		"name": "Pike",
		"measurement": "time",
		"description": "5 rounds for time of:\n\n75/55lb. thrusters, 20 reps\n\n10 strict ring dips\n20 push-ups\n10 strict handstand push-ups\n50-meter bear crawl\n\nPost time to comments.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.815Z"
	},
	{
		"id": "rEIgJj5bv8Ew89_mdFEffV3TZiM-KyFK",
		"name": "RJ / R.J.",
		"measurement": "time",
		"description": "Five rounds:\n\n800 m run\n5 rope climbs (15 ft/ 4.5m)\n\n50 push-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.834Z"
	},
	{
		"id": "Q183FiBYJ6BGP9OA5RiYkEy0IdEvTai5",
		"name": "Randy",
		"measurement": "time",
		"description": "75 reps power snatch, 75/55 lbs or\n  35/25 kg",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.827Z"
	},
	{
		"id": "eVSwmu5FUNPb9mTR4FhFYu0uV8X4BBox",
		"name": "René",
		"measurement": "time",
		"description": "7 rounds for time of:\n\nRun 400 meters\n21 walking lunges\n15 pull-ups\n9 burpees\n\nIf you have a 20-lb. weight vest or body armor, wear it.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.816Z"
	},
	{
		"id": "pI5tflZwojhDQ_lqg9pOpuDcrAiK4ABh",
		"name": "Rich",
		"measurement": "time",
		"description": "For time:\n\n13 squat snatches, 155 lb./105 lb.\n\n\nThen, 10 rounds of:\n\n10 pull-ups\n100-meter sprint\n\nThen,\n\n13 squat cleans, 155 lb./105 lb.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.804Z"
	},
	{
		"id": "IKieeAjCZ_z01qFVYVAtP5cjq5Vix85H",
		"name": "Riley",
		"measurement": "time",
		"description": "For time:\n\nRun 1.5 miles\n150 burpees\nRun 1.5 miles\n\nIf you've got a weight vest or body armor, wear it.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.852Z"
	},
	{
		"id": "5i-osRNh6dvb9JSw9QFiap_RKvs4RMgF",
		"name": "Robbie",
		"measurement": "repetitions",
		"description": "Complete as many rounds as possible in 25 minutes of:\n\n8 freestanding handstand push-ups\n15-foot L-sit rope climb, 1 ascent",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.855Z"
	},
	{
		"id": "u7-ARqjjw_CL7N4SaDWX3YmOKF1Zn3EG",
		"name": "Rocket",
		"measurement": "repetitions",
		"description": "Complete as many rounds as possible in 30 minutes of:\n\n50-yard swim\n10 push-ups\n15 squats",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.852Z"
	},
	{
		"id": "2OJonXs5ahB-NpEGPMOTaUEC9ERiFgRz",
		"name": "Roy",
		"measurement": "time",
		"description": "Five rounds:\n\n15 deadlifts, 225 lbs/155 lbs or\n  100 kg/70 kg\n20 box jumps, 24 inch/20 inch or\n  60 cm/50 cm\n25 pull-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.836Z"
	},
	{
		"id": "E7Rl_pw8B8L2_4nXDX7jLNqy2kwSnOn5",
		"name": "Ryan",
		"measurement": "time",
		"description": "Five rounds:\n\n7 muscle-ups\n21 burpees",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.828Z"
	},
	{
		"id": "HDqIphqcNd14Aj0Jx3vjhh8qhhypLhtm",
		"name": "Scooter",
		"measurement": "repetitions",
		"description": "On a 35-minute clock with a partner:\nComplete as many rounds as possible in 30 minutes of:\n\n30 double-unders\n15 pull-ups\n15 push-ups\n100-meter sprint\n\nThen, 5 minutes to find a 1-rep-max partner deadlift\nFor the AMRAP, have one partner work while the other rests, switching after\na full round is completed. If you're performing without a partner,\nrest 60 seconds between each round, and find a regular 1-rep-max deadlift.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.813Z"
	},
	{
		"id": "gQxYIH1uiD7XTpBcWeGLz5LHpGUBP-ym",
		"name": "Servais",
		"measurement": "time",
		"description": "For time:\n\nRun 1.5 miles\n\nThen, 8 rounds of:\n\n19 pull-ups\n19 push-ups\n19 burpees\n\nThen,\n\n400-meter sandbag carry (heavy)\n1-mile farmers carry with 45/35lb. dumbbells",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.818Z"
	},
	{
		"id": "qXWb1Lwuid0EdF9y6eU1URRL9qjDBWwI",
		"name": "Severin",
		"measurement": "time",
		"description": "50 strict pull-ups\n100 push-ups, release hands from\n  floor at the bottom\n5K run\n\nIf you’ve got a 20/14 pound vest or body armor, wear it.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.837Z"
	},
	{
		"id": "H0743PMbyz71COSSOr8j_D6eGnSQ7mP3",
		"name": "Sham",
		"measurement": "time",
		"description": "7 rounds for time of:\n\n11 body-weight deadlifts\n100-meter sprint",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.853Z"
	},
	{
		"id": "H8iJZ_NhAjMZfLVs-0bPx50dUXV75txD",
		"name": "Shawn",
		"measurement": "time",
		"description": "For time:\n\nRun 5 miles\n\nRun in 5-minute intervals, stopping\nafter each to perform 50 squats and 50 push-ups            before beginning the next 5-minute run            interval.\nPost time and number of intervals to complete the 5 miles to comments.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.856Z"
	},
	{
		"id": "F7bHdiKhDUcUCm2YnCNK6IUKUkQWLhf-",
		"name": "Sisson",
		"measurement": "repetitions",
		"description": "Complete as many rounds as possible in 20 minutes of:\n\n15-ft rope climb, 1 ascent\n5 burpees\n200-meter run\n\nIf you've got a 20-lb. vest or body armor, wear it.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.810Z"
	},
	{
		"id": "rWy7if3LkitmpRMKDuf60m88N-4Xeu0F",
		"name": "Small",
		"measurement": "time",
		"description": "Three rounds of:\n\nRow 1000 meters\n50 Burpees\n50 Box jumps, 24 inch/20 inch or\n  60 cm/50 cm box\nRun 800 meters",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.849Z"
	},
	{
		"id": "ucf5x-z3E1H4UL2FkO9ZmGQHRfchGkwz",
		"name": "Spehar",
		"measurement": "time",
		"description": "For time:\n\n100 Thrusters, 135 lbs/95 lbs or\n  60 kg/45 kg\n100 chest-to-bar pull-ups\nRun 6 miles\n\nPartition the thrusters, pull-ups and\nrun as needed.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.854Z"
	},
	{
		"id": "fploNb2z1e_bsyBATM1rxCVzoj0NhxGk",
		"name": "Stephen",
		"measurement": "time",
		"description": "30-25-20-15-10-5:\n\nGHD sit-up\nback extension\nknees to elbow\nStiff legged deadlift, 95/65 lbs\n  or 42.5/30 kg",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.831Z"
	},
	{
		"id": "U8m863D0ILgEGNJoX240Z6tO3GNckIgm",
		"name": "T.U.P.",
		"measurement": "time",
		"description": "15-12-9-6-3 reps for time of:\n\n135/95lb. power cleans\nPull-ups\n135/95lb. front squats\nPull-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.812Z"
	},
	{
		"id": "aF9nihdQSvnjOHZBUNK2YPVRpuAQPTBz",
		"name": "Taylor",
		"measurement": "time",
		"description": "4 rounds for time of:\n\nRun 400 meters\n5 burpee muscle-ups\n\nIf you've got a 20 lbs/14 lbs vest or body armor, wear it.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.850Z"
	},
	{
		"id": "qwxMX_bNjt5JOnCc6C5do2FHfpG5pplY",
		"name": "The Don",
		"measurement": "time",
		"description": "For time:\n\n66 deadlift 110/75 pounds or 50/30kg\n66 box jump 24\"/20\"\n66 KBS 1,5/1 pood or 53/35lb or 24/16 kg\n66 K2E\n66 sit ups\n66 pull up\n66 thruster 55/40 pounds or 25/15kg\n66 wall ball\n66 burpee\n66 DU",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.810Z"
	},
	{
		"id": "9ruSmFTfV1dug8bo-jTEP18qbvj_0Knk",
		"name": "The Lyon",
		"measurement": "time",
		"description": "5 rounds, each for time of:\n\n165-lb./110-lb. squat cleans, 7 reps\n\n165-lb./110-lb. shoulder-to-overheads, 7 reps\n7 burpee chest-to-bar pull-ups\nRest 2 minutes between rounds.\n\nIdeally, use a pull-up bar that is 6 inches above your max reach when standing.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.783Z"
	},
	{
		"id": "4Gj31XJyjn3e_05gXaXb5XpW3tkrJ1RT",
		"name": "The Seven",
		"measurement": "time",
		"description": "“The Seven” Seven rounds of:\n\n7 Handstand push-ups\n7 thrusters, 135 lbs/95 lbs or 60\n  kg/42,5 kg\n7 Knees to elbows\n7 deadlifts, 245 lbs/165 or 110 kg/75\n  kg\n7 burpees\n7 kettlebell swings, 2 pood/1,5\n  pood or 32kg/24kg\n7 pull-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.834Z"
	},
	{
		"id": "OZNHYvAHvQpb664xj38eM9tKcaYx_T3w",
		"name": "Thompson",
		"measurement": "time",
		"description": "10 rounds:\n\n1 Rope climb, 15 ft / 4.5 m\n29 back squats, 95 lbs/65 lbs or\n  42.5 kg/30 kg\n10 m farmers carry, 135 lbs/95 or 60 kg/45 kg\n\nBegin the rope climbs seated on the\nfloor.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.841Z"
	},
	{
		"id": "6VvL8OjWoHh-QdXzXT2PlJPo0v5yUkCl",
		"name": "Tiff",
		"measurement": "repetitions",
		"description": "On a 25-minute clock:\n\nRun 1.5 miles\n\nThen perform as many rounds as possible of:\n\n11 chest-to-bar pull-ups\n7 hang squat cleans, 155 lb.\n7 push presses, 155 lb.\n\nYour score is the completed rounds.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.797Z"
	},
	{
		"id": "F7mIBpajM8lK11pfR0RUmFYcWhGhj5ce",
		"name": "Tommy V",
		"measurement": "time",
		"description": "21 thrusters, 115/75-85 lbs or 52.5/37\n  kg\n12 rope climbs, 15 ft / 4.5 m\n15 thrusters\n9 rope climbs\n9 thrusters\n6 rope climbs",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.827Z"
	},
	{
		"id": "Pndx0WFvovH_Q3-kK4Is0E8p2ksdKiby",
		"name": "Tyler",
		"measurement": "time",
		"description": "Five rounds:\n\n7 muscle-ups \n21 sumo deadlift high-pulls, 95/65\n  lbs or 42.5/30 kg",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.830Z"
	},
	{
		"id": "kcELfcEBA1BCkwFqGx28VY8BW8c7cTc2",
		"name": "Viola",
		"measurement": "repetitions",
		"description": "Complete as many rounds as possible in 20 minutes of:\n\nRun 400 meters\n11 power snatches, 95 lb.\n17 pull-ups\n13 power cleans, 95 lb.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.807Z"
	},
	{
		"id": "bdV9fJXVMMAwA437VbijzJ5PLGqf1pdU",
		"name": "War Frank",
		"measurement": "time",
		"description": "Three rounds of:\n\n25 muscle-ups\n100 squats\n35 GHD sit-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.832Z"
	},
	{
		"id": "KzTG0MKQfqaG67skABG55lL3zUsTBO90",
		"name": "Weaver",
		"measurement": "time",
		"description": "Four rounds of:\n\n10 L-pull-ups\n15 Push-ups\n15 Chest to bar Pull-ups\n15 Push-ups\n20 Pull-ups\n15 Push-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.846Z"
	},
	{
		"id": "tq2o3Gj-ZDZCP86o-Qiad9R35uQk8BQ9",
		"name": "Wes",
		"measurement": "time",
		"description": "For time:\n\nRun 800 meters with a 25-lb. plate\n\nThen, 14 rounds of:\n5 strict pull-ups\n4 burpee box jumps, 24-in. box\n\n3 cleans, 185 lb.\nThen, run 800 meters with a 25-lb.\n  plate",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.802Z"
	},
	{
		"id": "PkwX2shFWtL0pLRpFtk528y4TzoURqu1",
		"name": "Weston",
		"measurement": "time",
		"description": "5 Rounds For Time: • 1000m Row            • 200m Farmer's Carry (2x20 kg) • 50m Waiters Walk-Right Arm\n(20 kg) • 50m Waiters Walk-Left (20 kg)",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.798Z"
	},
	{
		"id": "YsDXWLxs4gcEGWLULFD9Y__yIabGLRG-",
		"name": "White",
		"measurement": "time",
		"description": "5 rounds for time of:\n\n15-ft. rope climbs, 3 ascents\n\n10 toes-to-bars\n21 overhead walking lunge steps, 45-lb. plate\nRun 400 meters\n\nPost time to comments.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.804Z"
	},
	{
		"id": "8YKZEde4eSEIvJYkEO683wyk05WhBQEf",
		"name": "Whitten",
		"measurement": "time",
		"description": "Five rounds of:\n\n22 kettlebell swings, 2 pood/1,5\n  pood or 32 kg/24 kg\n22 box jump, 24 inch/20 inch or 60\n  cm/ 50 cm\n400 m run\n22 burpees\n22 wall ball shots, 20 pound/14 pound ball",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.842Z"
	},
	{
		"id": "GHYW5M__PW1KFRoLWX6oZQeEtBOR8kLW",
		"name": "Wilmot",
		"measurement": "time",
		"description": "Six rounds of:\n\n50 Squats\n25 Ring dips",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.848Z"
	},
	{
		"id": "Vsg0zsrR5tvYeVXV0OFiSSrziSjsrzzN",
		"name": "Wittman",
		"measurement": "time",
		"description": "Seven rounds of:\n\n15 kettlebell swings, 1.5 pood/1\n  pood or 24 kg/16 kg\n15 power cleans, 95 lbs/65 lbs or\n  42.5 kg/30 kg\n15 box jumps, 24 inch/ 20 inch or\n  60 cm/50 cm",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.844Z"
	},
	{
		"id": "bYgGq3iHmwPicv5CWwT0fkQl5xBVEugm",
		"name": "Wyk",
		"measurement": "time",
		"description": "5 rounds for time:\n\n5 Front squat, 225 lbs/155 lbs or\n  100 kg/70kg\n15-foot rope climbs, 5 ascents\nRun 400 meters with a 45 lbs/35\n  lbs plate",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.851Z"
	},
	{
		"id": "SIrXdby1-C8QLC1ulTwFxkPZQ831eBTx",
		"name": "Yeti",
		"measurement": "time",
		"description": "For time:\n\n25 pull-ups\n10 muscle-ups\n1.5-mile run\n10 muscle-ups\n25 pull-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.801Z"
	},
	{
		"id": "N4iKcAlqKQ-LlbXkOb11O7l2jgfEJuOn",
		"name": "Zembiec",
		"measurement": "time",
		"description": "5 rounds for time of:\n\n11 back squats, 185 lbs/125 lbs or\n  85 kg/55 kg\n7 strict burpee pull-ups\n400-meter run\n\nDuring each burpee pull-up perform\na strict push-up, jump to a bar\nthat is ideally 12 inches above your max standing reach, and perform\na strict pull-up.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.850Z"
	},
	{
		"id": "rtkKLCL9HprRHCdIokHBcQqqFa8DQ0oX",
		"name": "Zimmerman",
		"measurement": "repetitions",
		"description": "Complete as many rounds as possible in 25 minutes of:\n\n11 chest-to-bar pull-ups\n2 deadlifts, 315 lbs/ 205 lbs or\n  140 kg/90 kg\n10 handstand push-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T22:57:31.849Z"
	},
	{
		"id": "BBgDLxbimw4sv5oWQwkSPUUFmPlceitP",
		"name": "Amanda",
		"measurement": "time",
		"description": "For Time\n9, 7 and 5 reps of:\nMuscle-ups\nSnatches (135/95 lb.)",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.113Z"
	},
	{
		"id": "gf1Ryd9KKaZSk1JKWP2fOC7qa6enpnik",
		"name": "Angie",
		"measurement": "time",
		"description": "For Time\nComplete all reps of each exercise before moving to the\nnext.\n100 Pull-ups\n100 Push-ups\n100 Sit-ups\n100 Squats",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.108Z"
	},
	{
		"id": "easX-fO6Wl30BOmuMH-TzideQ34jcWPl",
		"name": "Annie",
		"measurement": "time",
		"description": "50-40-30-20 and 10 rep rounds; for time\nDouble-unders\nSit-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.112Z"
	},
	{
		"id": "qbk9NH2UhXv_rSmdLuLigqhxrrJnL5em",
		"name": "Barbara",
		"measurement": "time",
		"description": "5 rounds, time each round\n20 Pull-ups\n30 Push-ups\n40 Sit-ups\n50 Squats\nRest precisely three minutes between each round.",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.108Z"
	},
	{
		"id": "g0jqDzlQipaJ__1vhrrp-xoRAogO5JUt",
		"name": "Chelsea",
		"measurement": "repetitions",
		"description": "Each min on the min for 30 min\n5 Pull-ups\n10 Push-ups\n15 Squats",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.108Z"
	},
	{
		"id": "_1x2TSANY-55skJfbNzYDGCTuqNmJssP",
		"name": "Cindy",
		"measurement": "repetitions",
		"description": "As many rounds as possible in 20 min\n5 Pull-ups\n10 Push-ups\n15 Squats",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.109Z"
	},
	{
		"id": "atKGxjDBuHwRTe9Zf_wWw2O7dewFC6IH",
		"name": "Diane",
		"measurement": "time",
		"description": "21-15-9 reps, for time\nDeadlift 225 lbs\nHandstand push-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.109Z"
	},
	{
		"id": "sjYBDNZAba84rFe29TouiUfgfXzorajn",
		"name": "Elizabeth",
		"measurement": "time",
		"description": "21-15-9 reps, for time\nClean 135 lbs\nRing Dips",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.109Z"
	},
	{
		"id": "J8xpaBwhasF87tDw58056l7RSfRQVqXH",
		"name": "Eva",
		"measurement": "time",
		"description": "5 rounds for time.\nRun 800 meters\n2 pood KB swing, 30 reps\n30 pullups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.112Z"
	},
	{
		"id": "3AAhTSlP1qCzkHsE8zjWBM5BcXab3fXb",
		"name": "Fran",
		"measurement": "time",
		"description": "21-15-9 reps, for time\nThruster 95 lbs\nPull-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.109Z"
	},
	{
		"id": "VWbm_hf7erzpKaRsyMHwAqhVCrnE4re6",
		"name": "Grace",
		"measurement": "time",
		"description": "30 reps for time\nClean and Jerk 135 lbs",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.110Z"
	},
	{
		"id": "5DOg7lWH81HQ2ZYmbSlUC0_A9XNWgoW5",
		"name": "Helen",
		"measurement": "time",
		"description": "3 rounds for time\n400 meter run\n1.5 pood Kettlebell swing x 21\nPull-ups 12 reps",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.110Z"
	},
	{
		"id": "jL1gT4YEYTe9rpMsN9eZM7S-KMCGdB5n",
		"name": "Isabel",
		"measurement": "time",
		"description": "30 reps for time\nSnatch 135 pounds",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.110Z"
	},
	{
		"id": "mtPcwqsmlXkNwfBuofGhvuyBhA7wo4nc",
		"name": "Jackie",
		"measurement": "time",
		"description": "For time\n1000 meter row\nThruster 45 lbs (50 reps)\nPull-ups (30 reps)",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.110Z"
	},
	{
		"id": "W5lFKvXvfZJqt-CuBV3qMmYfFtNATHGq",
		"name": "Karen",
		"measurement": "time",
		"description": "For time\nWall-ball 150 shots",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.110Z"
	},
	{
		"id": "CNQFNeYCopYpOATWOpk78y4XkHSrh6H2",
		"name": "Kelly",
		"measurement": "time",
		"description": "Five rounds for time\nRun 400 meters\n30 box jump, 24 inch box\n30 Wall ball shots, 20 pound ball",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.112Z"
	},
	{
		"id": "Hxgbgu7gPj3fjDF0NQAyAfS-JhDMUQ9M",
		"name": "Linda (aka “3 bars of death”)",
		"measurement": "time",
		"description": "10/9/8/7/6/5/4/3/2/1 rep\nrounds for time\nDeadlift 1 1/2 BW\nBench BW\nClean 3/4 BW",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.111Z"
	},
	{
		"id": "NwWhzdP9ahl73-PU1K9RBGj-E4W0ZJQh",
		"name": "Lynne",
		"measurement": "repetitions",
		"description": "5 rounds for max reps. There is NO time component\nto this WOD, although some versions Rx the movements\nas a couplet.\nBodyweight bench press (e.g., same amount on bar as\nyou weigh)\npullups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.112Z"
	},
	{
		"id": "PGPzt0dTe3CyzapbGj5i92ZpJwFZK2EQ",
		"name": "Mary",
		"measurement": "repetitions",
		"description": "As many rounds as possible in 20 min\n5 Handstand push-ups\n10 1-legged squats\n15 Pull-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.111Z"
	},
	{
		"id": "G8UCjBVxVdP5IvNf7NX0RnO6lvyo2clo",
		"name": "Nancy",
		"measurement": "time",
		"description": "5 rounds for time\n400 meter run\nOverhead squat 95 lbs x 15",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.111Z"
	},
	{
		"id": "JhF0oFC2nomYgOCl5CV9R7o3jfPet3Tp",
		"name": "Nicole",
		"measurement": "repetitions",
		"description": "As many rounds as possible in 20 minutes.\nNote number of pull-ups completed for each round.\nRun 400 meters\nMax rep Pull-ups",
		"global": true,
		"userId": admin.id,
		"modifiedAt": "2018-02-25T23:59:11.112Z"
	}
]);
