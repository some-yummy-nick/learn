import React, {Component} from 'react';
import './App.css';

const DEFAULT_QUERY = 'new';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';
const DEFAULT_HPP = '100';

const Search = ({value, onChange,onSubmit, children}) =>
	<form onSubmit={onSubmit}>
		<input
			type="text"
			value={value}
			onChange={onChange}
		/>
		<button type="submit">
			{children}
		</button>
	</form>

const Table = ({list, onDismiss}) =>
	<div className="table">
		{list.map(item =>
			<div key={item.objectID} className="table-row">
							<span style={{width: '40%'}}>
							<a href={item.url}>{item.title}</a>
							</span>
				<span style={{width: '30%'}}>{item.author}</span>
				<span style={{width: '10%'}}>{item.num_comments}</span>
				<span style={{width: '10%'}}>{item.points}</span>
				<span style={{width: '10%'}}>
							<Button onClick={() => onDismiss(item.objectID)}
							        className="button-inline">Отбросить</Button>
						</span>
			</div>
		)}
	</div>


const Button = ({onClick, className = "", children,}) =>
	<button onClick={onClick} className={className} type="button">
		{children}
	</button>

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			result: null,
			searchTerm: DEFAULT_QUERY
		}
	}

	fetchSearchTopStories(searchTerm,page = 0) {
		fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
			.then(response => response.json())
			.then(result => this.setSearchTopStories(result))
			.catch(error => error);
	}

	componentDidMount() {
		const { searchTerm } = this.state;
		fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
			.then(response => response.json())
			.then(result => this.setSearchTopStories(result))
			.catch(error => error);
		this.fetchSearchTopStories(searchTerm);
	}

	onDismiss = (id) => {
		const isNotId = item => item.objectID !== id;
		const updatedHits = this.state.result.hits.filter(isNotId);
		this.setState({
			result:{ ...this.state.result, hits: updatedHits }
		})

	};

	onSearchChange = (e) => {
		this.setState({searchTerm: e.target.value});
	};

	setSearchTopStories = (result) => {
		const { hits, page } = result;
		const oldHits = page !== 0
			? this.state.result.hits
			: [];
		const updatedHits = [
			...oldHits,
			...hits
		];
		this.setState({
			result: { hits: updatedHits, page }
		})
	}

	onSearchSubmit=(e)=> {
		e.preventDefault();
		const { searchTerm } = this.state;
		this.fetchSearchTopStories(searchTerm);
	}

	render() {

		const {searchTerm, result} = this.state;
		const page = (result && result.page) || 0;
		return (
			<div className="page">
				<div className="interactions">
					<Search
						value={searchTerm}
						onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>
						Поиск
					</Search>
				</div>
				{result
					?
					<Table
						list={result.hits}
						onDismiss={this.onDismiss}
					/>
					: null
				}
				<div className="interactions">
					<Button onClick={() => this.fetchSearchTopStories(searchTerm, page + 1)}>
						Больше историй
					</Button>
				</div>

			</div>
		);
	}
}

export default App;
