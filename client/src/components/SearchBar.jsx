const categories = ['Electronics', 'Fashion', 'Books', 'Home'];

export default function SearchBar({ search, category, onSearchChange, onCategoryChange }) {
  return (
    <div className="product-filters">
      <label className="visually-hidden" htmlFor="product-search">Search products</label>
      <input id="product-search" type="search" placeholder="Search products..." value={search} onChange={(event) => onSearchChange(event.target.value)} />
      <label className="visually-hidden" htmlFor="product-category">Filter by category</label>
      <select id="product-category" value={category} onChange={(event) => onCategoryChange(event.target.value)}>
        <option value="">All Categories</option>
        {categories.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </div>
  );
}
