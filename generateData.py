import pandas as pd 
import numpy as np 
from math import *


def generate_test_data():

    x=np.linspace(0,1,num=1000)
    y=0 + x + np.random.normal(size=len(x)) * np.sqrt(0.1)
    z=0 + np.sin(pi/2. * x) + np.random.normal(size=len(x)) * np.sqrt(0.1)

    dfs=[]

    for sigma in np.logspace(-1,0,num=10):
        y=0 + np.sin(pi/2. * x) + np.random.normal(size=len(x)) * np.sqrt(sigma)

        df = pd.DataFrame({"x" : x , "y":y })
        df["sigma"]=sigma
        dfs.append(df)
    



    return pd.concat(dfs)

if __name__ == "__main__":

    data=generate_test_data()
    data.to_csv("test.dat",sep=" ",index=False)

    