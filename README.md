# benfords-law-resultado-eleicoes-brasil-2018

Benford's Law - Resultado Eleições Brasil 2018

You will need to have nodejs installed. I recommend you installing via [NVM](https://github.com/creationix/nvm#installation).

Clone this repo
```sh
git clone https://github.com/danielsan/benfords-law-resultado-eleicoes-brasil-2018
```

Enter the directory and install the dependecies
```sh
cd benfords-law-resultado-eleicoes-brasil-2018
npm install
```

Run the NPM start script and pass the UF two-letter code as an argument
```sh
npm start SP # SP is just an example, you can use any other state like RJ, PR, RR, RO, RS, etc...
```

This is an example of a result
```sh
✔ Processing lines 1101826
   Benfords Curve
37        _________________________________________________________________
34        _________________________________________________________________
31        _________________________________________________________________
28        _________________________________________________________________
25        _________________________________________________________________
23        _________________________________________________________________
20        _       _________________________________________________________
17        _       _________________________________________________________
14        _       _________________________________________________________
11        _       _       _________________________________________________
 9        _       _       _________________________________________________
 6        _       _       _       _________________________________________
 3        _       _       _       _       _▄▄▄▄▄▄▄_________________________
   1       2       3       4       5       6       7       8       9       

Benfords Curve Report
inital number 1 appears 36.67% of the time |  404078 / 1101927
inital number 2 appears 21.56% of the time |  237626 / 1101927
inital number 3 appears 13.68% of the time |  150789 / 1101927
inital number 4 appears 08.50% of the time |   93614 / 1101927
inital number 5 appears 05.75% of the time |   63404 / 1101927
inital number 6 appears 04.27% of the time |   47094 / 1101927
inital number 7 appears 03.51% of the time |   38639 / 1101927
inital number 8 appears 03.11% of the time |   34249 / 1101927
inital number 9 appears 02.94% of the time |   32434 / 1101927


Candidates
12 has 10.22% of votes with  2,650,440 total votes
13 has 14.79% of votes with  3,833,982 total votes
15 has 01.03% of votes with    267,725 total votes
16 has 00.05% of votes with     12,434 total votes
17 has 47.73% of votes with 12,378,012 total votes
18 has 01.01% of votes with    262,050 total votes
19 has 00.69% of votes with    177,949 total votes
27 has 00.06% of votes with     14,462 total votes
30 has 04.10% of votes with  1,062,118 total votes
45 has 08.58% of votes with  2,224,049 total votes
50 has 00.72% of votes with    187,451 total votes
51 has 01.06% of votes with    274,672 total votes
54 has 00.03% of votes with      7,435 total votes
95 has 03.23% of votes with    837,211 total votes
96 has 06.71% of votes with  1,740,759 total votes

Total votes 25,930,749
```