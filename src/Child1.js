import React, {Component} from "react";
import * as d3 from "d3";

class Child1 extends Component
{
    state = {
        company: "Apple", // Default Company
        selectedMonth: 'November' //Default Month
    };

    componentDidMount()
    {
        console.log(this.props.csv_data) // Use this data as default. When the user will upload data this props will provide you the updated data
    }

    getFilteredData()
    {
        const {company, selectedMonth} = this.state;
        const {csv_data} = this.props;

        return csv_data.filter((d) =>
        {
            const month = d.Date.toLocaleString("default", {month: "long"});
            return d.Company === company && month === selectedMonth;
        });
    }


    renderStockChart()
    {
        const data = this.getFilteredData();
        const svgWidth = 800;
        const svgHeight = 400;
        const margin = {top: 20, right: 30, bottom: 50, left: 50};

        d3.select(this.refs.chart)
            .selectAll("*")
            .remove();

        const svg = d3
            .select(this.refs.chart)
            .attr("width", svgWidth)
            .attr("height", svgHeight);

        const chartWidth = svgWidth - margin.left - margin.right;
        const chartHeight = svgHeight - margin.top - margin.bottom;

        const g = svg
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const xScale = d3
            .scaleTime()
            .domain(d3.extent(data, (d) => d.Date))
            .range([0, chartWidth]);

        const yScale = d3
            .scaleLinear()
            .domain([
                d3.min(data, (d) => Math.min(d.Open, d.Close)),
                d3.max(data, (d) => Math.max(d.Open, d.Close)),
            ])
            .range([chartHeight, 0]);

        g.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %d")));

        g.append("g").call(d3.axisLeft(yScale));

        const openLine = d3
            .line()
            .x((d) => xScale(d.Date))
            .y((d) => yScale(d.Open));

        const closeLine = d3
            .line()
            .x((d) => xScale(d.Date))
            .y((d) => yScale(d.Close));

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#b2df8a")
            .attr("stroke-width", 2)
            .attr("d", openLine);

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#e41a1c")
            .attr("stroke-width", 2)
            .attr("d", closeLine);

        g.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d) => xScale(d.Date))
            .attr("cy", (d) => yScale(d.Open))
            .attr("r", 4)
            .attr("fill", "#b2df8a")
            .on("mouseover", (event, d) =>
            {
                const tooltip = d3.select(this.refs.tooltip);
                const diff = (d.Close - d.Open).toFixed(2);
                tooltip
                    .style("opacity", 1)
                    .html(
                        `Date: ${d.Date.toDateString()}<br>
             Open: ${d.Open.toFixed(2)}<br>
             Close: ${d.Close.toFixed(2)}<br>
             Difference: ${diff}`
                    )
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 40}px`);
            })
            .on("mouseout", () =>
            {
                d3.select(this.refs.tooltip).style("opacity", 0);
            });


        g.selectAll(".dot-close")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d) => xScale(d.Date))
            .attr("cy", (d) => yScale(d.Close))
            .attr("r", 4)
            .attr("fill", "#e41a1c");

        svg
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top / 2})`)
            .selectAll("text")
            .data(["Open", "Close"])
            .enter()
            .append("text")
            .attr("x", (_, i) => i * 100)
            .attr("fill", (_, i) => (i === 0 ? "#b2df8a" : "#e41a1c"))
            .text((d) => d);
    }

    componentDidUpdate()
    {
        console.log(this.props.csv_data);
        this.renderStockChart();
    }

    render()
    {
        const {company, selectedMonth} = this.state;

        const options = ['Apple', 'Microsoft', 'Amazon', 'Google', 'Meta']; // Use this data to create radio button
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; // Use this data to create dropdown

        return (
            <div className="child1" style={{marginTop: "2rem", marginLeft: "2rem"}}>
                <div className="filters">
                    <div className="company-options">
                        {options.map((option) => (
                            <label key={option}>
                                <input
                                    type="radio"
                                    name="company"
                                    value={option}
                                    checked={company === option}
                                    onChange={() => this.setState({company: option})}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                    <div className="month-options">
                        <select
                            value={selectedMonth}
                            onChange={(e) => this.setState({selectedMonth: e.target.value})}
                        >
                            {months.map((month) => (
                                <option key={month} value={month}>
                                    {month}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <svg ref="chart" style={{marginTop: "3rem"}}></svg>
                <div ref="tooltip" className="tooltip"/>
            </div>
        );
    }
}

export default Child1;