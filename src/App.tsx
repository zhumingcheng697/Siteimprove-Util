import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
    interface RawData {
        "items": [
            {
                "id": number,
                "title": string,
                "url": string,
                "broken_links": number,
                "_siteimprove": {
                    "page_report": {
                        "href": string
                    }
                }
            }
        ];
    }

    interface PageData {
        title: string,
        url: string,
        broken_links: number,
        report_url: string
    }

    const [pageData, setPageData] = useState<PageData[]>([]);

    return (
        <div className="App">
            <form className="SearchForm" onSubmit={ e => {
                e.preventDefault();

                axios.get(`https://api.siteimprove.com/v2/sites/${ process.env.REACT_APP_SITE_IMPROVE_SITE_ID }/quality_assurance/links/pages_with_broken_links?page=1&page_size=${ e.currentTarget.page_size.value }&query=${ encodeURIComponent(e.currentTarget.query.value) }&search_in=${ e.currentTarget.search_in.value }`, {
                    auth: {
                        username: process.env.REACT_APP_SITE_IMPROVE_USERNAME as string,
                        password: process.env.REACT_APP_SITE_IMPROVE_API_KEY as string
                    }
                }).then((res) => {
                    const data: RawData = res.data;

                    if (!data.items.length) {
                        alert("No matches found!");
                        setPageData([]);
                        return;
                    }

                    const mapped = data.items.map((e) => ({
                        title: e.title,
                        url: e.url,
                        broken_links: e.broken_links,
                        report_url: e["_siteimprove"]["page_report"].href
                    }));
                    setPageData(mapped);
                }).catch((e) => {
                    alert(`Error: ${ e }`);
                    console.error(e);
                });
            } }>
                <label htmlFor="query">Title or URL</label>
                <input id="query" name="query" type="text" placeholder="Student Information and Resources"/>

                <label htmlFor="search_in">Search Method</label>
                <select name="search_in" id="search_in">
                    <option value="url">URL</option>
                    <option value="title">Title</option>
                </select>
                <label htmlFor="page_size">Result Amount</label>
                <input id="page_size" name="page_size" type="number" min={ 1 } max={ 50 } defaultValue={ 10 }/>
                <input type="submit" value="Search"/>
                { !!pageData.length &&
                    <input type="reset" value="Clear Results" onClick={ e => {
                        e.preventDefault();
                        setPageData([]);
                    }
                    }/>
                }
            </form>
            { !!pageData.length && pageData.map(e => {
                return <div className="PageDatum" key={ e.url }>
                    <strong>{ e.title }</strong>
                    <p>{ e.url }</p>
                    <p>{ e.broken_links } broken link(s)</p>
                    <a href={ e.report_url }>View Report</a>
                </div>;
            }) }
        </div>
    );
}

export default App;
