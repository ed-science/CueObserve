import React, { useState, useEffect } from "react";
import style from "./style.module.scss";
import { components } from "react-select";
import CreatableSelect from "react-select/creatable";
import { Modal, Select, Spin, Switch, Button, Radio, notification, Drawer } from "antd";
import datasetService from "services/datasets";
import anomalyDefService from "services/anomalyDefinitions.js";
import  _ from "lodash";

const { Option } = Select;

let options = [];
let allOptions = {};
let tempOption = {};

function generateOptions(autoCueOptions) {
  options = [];
  allOptions = {};

  if (autoCueOptions.metrics && autoCueOptions.metrics.length) {
    allOptions.metric = [];
    autoCueOptions.metrics.forEach(q => {
      options.push({
        value: q,
        label: q,
        optionType: "Measure",
        color: "#4B0082"
      });
      allOptions.metric.push({
        value: q,
        label: q,
        optionType: "Measure",
        color: "#4B0082"
      });
    });
  }

  allOptions.dimension = [];
  if (autoCueOptions.dimensions && autoCueOptions.dimensions.length) {
    autoCueOptions.dimensions.forEach(q => {
      allOptions.dimension.push({
        value: q,
        label: q,
        optionType: "Dimension",
        color: "#12b1ff"
      });
    });
  }


  allOptions.highOrLow = [
    {
      value: "High",
      label: "High",
      optionType: "High Or Low",
      color: "#02c1a3"
    },
    {
      value: "Low",
      label: "Low",
      optionType: "High Or Low",
      color: "#02c1a3"
    }
  ];

  allOptions.top = [
    {
      value:"Top",
      label:"Top",
      optionType:"Top",
      color:"#ff6767"
    }
  ]

  allOptions.dimVal = [
    {
      value:10 + "",
      label: 10 + "",
      optionType: "Dimension Values",
      color:"#ff6767"

    },
    {
      value:20 + "",
      label: 20 + "",
      optionType: "Dimension Values",
      color:"#ff6767"

    },
    {
      value:30 + "",
      label: 30 + "",
      optionType: "Dimension Values",
      color:"#ff6767"

    },
    {
      value:40 + "",
      label: 40 + "",
      optionType: "Dimension Values",
      color:"#ff6767"

    }
  ]

}

function updateHelpText(selectedOption) {
  let elements = document.getElementsByClassName("autocue-help");
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
  if (selectedOption) {
    setTimeout(function() {
      let elements = document.getElementsByClassName("autoCueOptions");
      let element = elements[elements.length - 1];
      let helpText = getHelpText(selectedOption);
      // if (element){
      //   element.innerHTML +=
      //     "<span class='autocue-help'>" + helpText + "</span>";
      // }
    }, 150);
  }
}



function getMetricHelpText(value, opts) {
    options = [
      ...allOptions.dimension,
      ...allOptions.highOrLow
    ];
    return " [Dimension Top 10]";
  }

function getDimensionHelpText(value, opts) {
  if(opts){
    options = [];
    options = [...options, ...allOptions.top];
    return " [High/Low]";
  }
}

function getTopHelpText(value, opts) {
  options = []
  options = [...options, ...allOptions.dimVal]
  return ""
}

function getDimValHelpText(value, opts) {
  options = []
  options = [...options, ...allOptions.highOrLow]
  return ""
}

function getHelpText(selectedOption) {
  if (selectedOption && selectedOption.length) {
    let length = selectedOption.length;
    let lastOption = selectedOption[length - 1];
    let text = "";
    if (lastOption.__isNew__) {
      // when custom input by user
      // check in options of callback validation functions
          let newOption = lastOption;
          newOption.value = lastOption.value;
          newOption.label = lastOption.value + " ";
          newOption.optionType = "Dimension Values"
          newOption.color = "#ff6767"
          selectedOption.pop();
          selectedOption.push(newOption);
          lastOption = newOption
          tempOption = lastOption
      }

    switch (lastOption.optionType) {
      case "Measure":
        text = getMetricHelpText(lastOption.value, selectedOption);
        tempOption = lastOption
        break;
      case "High Or Low":
        options = [];
        break;
      case "Dimension":
        if (lastOption.optionType === "Dimension" && tempOption.optionType === "Top"){
         lastOption =  selectedOption.pop()
         text = getMetricHelpText(lastOption.value, selectedOption);
         tempOption = lastOption
        }
        else {
        text = getDimensionHelpText(lastOption.value, selectedOption);
        let defaultOption1 = options.pop()  
        selectedOption.push(defaultOption1)
        lastOption = defaultOption1
        text = getTopHelpText(lastOption.value, selectedOption)
        let defaultOption2 = options.shift()
        selectedOption.push(defaultOption2)
        lastOption = defaultOption2
        text = getDimValHelpText(lastOption.value, selectedOption)
        }
        break;
      case "Top":
        text = getTopHelpText(lastOption.value, selectedOption)
        tempOption = lastOption
        break;
      case "Dimension Values":
        text = getDimValHelpText(lastOption.value, selectedOption)
        tempOption = lastOption
        break;

    }
    return text;
  }
  else{
      options = []
      options = [...options, ...allOptions.metric]
      return options
  }
  // return "";
}

export default function AddAnomalyDef(props){
  const [allDatasets, setAllDatasets] = useState([]);
  const [datasetId, setDatasetId] = useState();
  const [selectedOption, setSelectedOption] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(()=>{
    if (allDatasets.length == 0){
      getDatasets();
    }
  }, []);


const getDatasets = async () => {
  const data = await datasetService.getDatasets()
  setAllDatasets(data)
}
const getDataset = async (datasetId) => {
  const data = await datasetService.getDataset(datasetId)
    generateOptions(data) 
}
 const handleAddAnomaly = () => {
    if ( _.isNull(selectedOption ) ||  selectedOption.length < 1) {
      notification.warning({
        message: "At least Measure required to configure anomaly !"
           });
      return;
    }

    var payload = {
      datasetId: datasetId,
      measure: selectedOption[0].value
    };

    let isDimension = false
    let topVal = null;
    selectedOption.forEach(item => {
      if (item.optionType === "High Or Low") {
        payload.highOrLow = item.value;
      }
      if (item.optionType === "Dimension") {
        payload.dimension = item.value;
        isDimension = true
      }
      if (item.optionType === "Dimension Values"){
        payload.top = item.value
        topVal = item.value
      }
    });

    if(isDimension && _.isNull(topVal)){
      notification.warning({
        message: "Please Enter Top Values "
           });
      return;
    }

    getAddAnomaly(payload)
  };

  const getAddAnomaly = async (payload) =>{
    const response = await anomalyDefService.addAnomalyDef(payload)
    // check success in response and add show error message if failed
    if(response.success){
      props.onAddAnomalyDefSuccess(true)
    }
    setSelectedOption([])
  }

 const handleDatasetChange = value => {
    setSelectedOption([])
    setDatasetId(value)
    getDataset(value)
  };

  const handleChange = selectedOption => {
    setSelectedOption(selectedOption)
    setIsFocused(false)
    // updateOptions(selectedOption);
    updateHelpText(selectedOption);
    setTimeout(() => {
      setIsFocused(true)
    }, 200);
  };

  const  singleOption = props => {
    if (props && props.label && props.label.indexOf("Create ") !== -1) {
      return (
        <components.Option {...props}>
          <div className={style.optionWrapper}>
            <span className={style.subText}>{props.data.optionType}</span>
            <p style={{ color: props.data.color }} className={style.option}>
              {props.value}
            </p>
          </div>
        </components.Option>
      );
    } else {
      return (
        <components.Option {...props}>
          <div className={style.optionWrapper}>
            <p style={{ color: props.data.color }} className={style.option}>
              {props.label}
            </p>
            <span className={style.subText}>{props.data.optionType}</span>
          </div>
        </components.Option>
      );
    }
  };

  const multiValue = props => {
    return (
      <components.MultiValue {...props}>
        <div style={{ background: "white" }}></div>
      </components.MultiValue>
    );
  };

  const  multiValueContainer = props => {
    return (
      <components.MultiValueContainer {...props}>
        <div
          className={`autoCueOptions ${style.selectedOption}`}
          style={{ color: props.data.color }}
        >
          {props.data.label}
        </div>
      </components.MultiValueContainer>
    );
  };

  const handleOnCancel = () =>{
    props.onAddAnomalyDefSuccess(false)
    setSelectedOption([])
  }

  const handleIsFocused = (val) => {
    setIsFocused(val)
  }

    var datasetOption = [];
    datasetOption = allDatasets && allDatasets.map(dataset => (
      <Option value={dataset.id} key={dataset.id}>
        {dataset.name}
      </Option>
    ));

    return (
      <div>
          <Drawer
            title="Add Anomaly Definition"
            width="50%"
            centered
            visible={true}
            key="addAnomalyModal"
            centered="true"
            onClose={handleOnCancel}

          >
            <div >
              <div className="mb-6">
                <Select
                className={`${style.selectEditor}`}
                  showSearch
                  placeholder="Select a dataset"
                  optionFilterProp="children"
                  onChange={handleDatasetChange}
                //   notFoundContent={
                //     this.props.cubes.loading ? <Spin size="small" /> : null
                //   }
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {datasetOption}
                </Select>
              </div>
            <div className="mb-6">
              <CreatableSelect
                styles={{
                  indicatorSeparator: () => {}, // removes the "stick"
                  dropdownIndicator: defaultStyles => ({
                    ...defaultStyles,
                    "& svg": { display: "none" }
                  })
                }}
                isMulti
                value={selectedOption}
                className={`${style.filterEditor}`}
                onChange={handleChange}
                onFocus={()=>handleIsFocused(true)}
                onBlur={() => handleIsFocused(false)}
                menuIsOpen={isFocused}
                components={{
                  Option: singleOption,
                  MultiValue: multiValue,
                  MultiValueContainer: multiValueContainer
                }}
                options={options}
                placeholder="Measure [Dimension Top N] [High/Low] "
              />
              </div>
            <div className="mb-6">
            <Button
              key="back"
              type="primary"
              onClick={() => handleAddAnomaly()}
              >
              Save Anomaly Definition
              </Button>
              </div>
          </div>
            
          </Drawer>
      </div>
    );
  }
// }
