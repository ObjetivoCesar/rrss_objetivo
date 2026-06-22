import pandas as pd
df = pd.read_excel('conversaciones_2026-06-18.xlsx')
df.to_csv('conversaciones_temp.csv', index=False, encoding='utf-8')
