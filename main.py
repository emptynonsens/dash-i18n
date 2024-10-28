import dash
from dash import dcc, html, clientside_callback, ClientsideFunction, Output, Input, State, Dash, dash_table
import pandas as pd
import plotly.express as px

import os
from flask import json
# import dash_core_components as dcc

# Sample DataFrame

category_a = "devtrn_A"
category_b = "devtrn_B"

df = pd.DataFrame({
    "devtrn_x": [1, 2, 3, 4, 5],
    "devtrn_y": [10, 11, 12, 13, 14],
    "category": [category_a, category_b, category_a, category_b, category_a]
})

def lang_json_load(lang:str):
    file_path = os.path.join("translations", f"{lang}.json")
    with open(file_path, "r", encoding='utf-8') as f:
        json_content = f.read()
        return json.loads(json_content)

# Create a simple scatter plot
fig = px.scatter(df, x="devtrn_x", y="devtrn_y", color="category", title="devtrn_chartTitle")

app = Dash(__name__)

app.layout = html.Div([
    dcc.Store(id="tranlsation-store"),
    dcc.Store(id='tranlsation-target'),
    html.H1("devtrn_Title"),
    
    dcc.Dropdown(options=['eng','pl'], value ='eng', id='dropdown_translateDropdown', persistence=True), # default value from navigator.language
    html.Div(id='tranlsations-available'),
    dcc.Graph(
        id='scatter-plot',
        figure=fig
    ),
    dcc.Input(id='input-box', type='text', value='devtrn_inputBox'),
    html.Button('Submit', id='button'), 
    html.Div(id='output-container-button', children='Enter a value and press submit'),
    html.Br(),
    dash_table.DataTable(
        id='table',
        columns=[{"name": i, "id": i} for i in df.columns],
        data=df.to_dict('records'),
    ),
    html.Button('refresh', id='btn_refresh'),

])

@app.callback(
    Output('table', 'data'),
    Input('btn_refresh', 'n_clicks')
)
def refresh_table(n_clicks):
    if n_clicks:
        new_row = {
            "devtrn_x": df["devtrn_x"].max() + 1,
            "devtrn_y": df["devtrn_y"].max() + 1,
            "category": category_a if n_clicks % 2 == 0 else category_b
        }
        df.loc[len(df)] = new_row
    return df.to_dict('records')

@app.callback(
    Output('tranlsation-store', 'data'),
    Input('dropdown_translateDropdown', "value"),
)
def load_translation(lng):
    return lang_json_load(lng)

clientside_callback(
    """
    function(translation) {
        return JSON.stringify(translation, null, 2);
    }
    """,
    Output('tranlsations-available', 'children'),
    Input('tranlsation-store', 'data'),
)

# OPTIONAL - This callback will reload the page when the language is changed
clientside_callback(
    """
    function(translation) {
        if (translation) {
            location.reload();
        }
    }
    """,
    Output('tranlsation-store', 'data', allow_duplicate=True),
    Input('dropdown_translateDropdown', "value"),
    prevent_initial_call=True
)



clientside_callback(
    ClientsideFunction(namespace='translations', function_name='observeDOMChanges'),
    Output('tranlsation-target', 'data'),
    Input('tranlsation-store', 'data'),
    # Input(AIO_OffCanvasGlobal.ids.offCanvas(offCanvasId), 'is_open')
)

@app.callback(
    Output('output-container-button', 'children'),
    Input('button', 'n_clicks'),
    State('input-box', 'value')
)
def update_output(n_clicks, value):
    return 'The input value was "{}" and the button has been clicked {} times'.format(value, n_clicks)



if __name__ == '__main__':
    app.run_server(debug=True)

