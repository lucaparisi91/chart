import pandas as pd 
import numpy as np 
from math import *

def generate_test_data():

    x=np.linspace(0,1,num=1000)
    y=0 + x + np.random.normal(size=len(x)) * np.sqrt(0.1)
    z=0 + np.sin(pi/2. * x) + np.random.normal(size=len(x)) * np.sqrt(0.1)


    df = pd.DataFrame({"x" : x , "y":y,"z":z })

    df["hue"]="firstHalf"
    df.loc[df["x"]<0.5,"hue"]="secondHalf"


    return df

if __name__ == "__main__":

    data=generate_test_data()
    data.to_csv("test.dat",sep=" ",index=False)

    