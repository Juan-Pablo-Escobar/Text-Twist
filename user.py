from ast import For
from copyreg import constructor
from itertools import count
from multiprocessing.spawn import import_main_path
from traceback import print_tb
import pandas as pd
from pyparsing import counted_array
import numpy as np
from random import randint

abecedario = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "ñ", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]

data = pd.read_csv("./private/Palabras Español.csv")

print(data["a"][0])


accepted = True
while accepted:

    letras = []

    palabras = []
    
    palabraganadora = False

    for i in range(6):
        letras.append(abecedario[randint(0,26)])
    
    for j in range(len(data)):
        if 3<=len(data["a"][j])<=6:
            palabra = data["a"][j]
            for k in range(6):
                if palabra.find(letras[k]) != -1:
                    palabra = palabra.replace(palabra[palabra.find(letras[k])],"")
            if(len(palabra) == 0):
                palabras.append(data["a"][j])
                if(len(data["a"][j])==6):
                    palabraganadora = True
    if(palabraganadora and len(palabras)>=20):
        print("encontrado")
        print(palabras)
    