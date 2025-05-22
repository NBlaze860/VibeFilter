import React, { useState, useEffect } from 'react';

function Popup() {
  // State for input fields for adding new filters
  const [includeInput, setIncludeInput] = useState('');
  const [notIncludeInput, setNotIncludeInput] = useState('');
  const [eitherOrInput, setEitherOrInput] = useState('');

  // State for lists of active filters for each category
  const [includeFilters, setIncludeFilters] = useState([]);
  const [notIncludeFilters, setNotIncludeFilters] = useState([]);
  const [eitherOrFilters, setEitherOrFilters] = useState([]);

  // Effect to load filters from Chrome local storage when the component mounts.
  // This ensures that previously added filters are displayed when the popup is opened.
  useEffect(() => {
    // Check if the Chrome API is available (important for development outside the extension environment)
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['includeFilters', 'notIncludeFilters', 'eitherOrFilters'], (result) => {
        if (result.includeFilters) {
          setIncludeFilters(result.includeFilters);
        }
        if (result.notIncludeFilters) {
          setNotIncludeFilters(result.notIncludeFilters);
        }
        if (result.eitherOrFilters) {
          setEitherOrFilters(result.eitherOrFilters);
        }
      });
    }
  }, []); // Empty dependency array means this effect runs only once on mount

  // Effect to save 'includeFilters' to Chrome local storage and send a message
  // to the background script whenever the 'includeFilters' state changes.
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ includeFilters });
      // Send the updated list of include filters to the background script
      chrome.runtime.sendMessage({ type: 'updateFilters', include: includeFilters });
    }
  }, [includeFilters]); // This effect runs whenever 'includeFilters' state changes

  // Effect to save 'notIncludeFilters' to Chrome local storage and send a message
  // to the background script whenever the 'notIncludeFilters' state changes.
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ notIncludeFilters });
      // Send the updated list of not-include filters to the background script
      chrome.runtime.sendMessage({ type: 'updateFilters', notInclude: notIncludeFilters });
    }
  }, [notIncludeFilters]); // This effect runs whenever 'notIncludeFilters' state changes

  // Effect to save 'eitherOrFilters' to Chrome local storage and send a message
  // to the background script whenever the 'eitherOrFilters' state changes.
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ eitherOrFilters });
      // Send the updated list of either-or filters to the background script
      chrome.runtime.sendMessage({ type: 'updateFilters', eitherOr: eitherOrFilters });
    }
  }, [eitherOrFilters]); // This effect runs whenever 'eitherOrFilters' state changes

  /**
   * Adds a new filter to the specified filter list.
   * It also clears the input field after adding.
   * @param {string} inputValue - The current value from the input field.
   * @param {Function} setInput - The setState function for the specific input field (e.g., setIncludeInput).
   * @param {Function} setFilters - The setState function for the specific filter list (e.g., setIncludeFilters).
   * @param {string[]} currentFilters - The current array of filters for that category.
   */
  const addFilter = (inputValue, setInput, setFilters, currentFilters) => {
    const trimmedValue = inputValue.trim();
    // Only add the filter if the trimmed value is not empty and not already present in the list
    if (trimmedValue !== '' && !currentFilters.includes(trimmedValue)) {
      const newFilters = [...currentFilters, trimmedValue];
      setFilters(newFilters); // Update the state, which triggers the corresponding useEffect to save/send
      setInput(''); // Clear the input field after adding the filter
    }
  };

  /**
   * Removes a filter from the specified filter list.
   * @param {string} filterToRemove - The specific filter string to be removed.
   * @param {Function} setFilters - The setState function for the specific filter list.
   * @param {string[]} currentFilters - The current array of filters for that category.
   */
  const removeFilter = (filterToRemove, setFilters, currentFilters) => {
    const newFilters = currentFilters.filter(filter => filter !== filterToRemove);
    setFilters(newFilters); // Update the state, which triggers the corresponding useEffect to save/send
  };

  // Event handler for "Include" filter form submission
  const handleSubmitInc = (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)
    addFilter(includeInput, setIncludeInput, setIncludeFilters, includeFilters);
  };

  // Event handler for "Do not include" filter form submission
  const handleSubmitNotInc = (e) => {
    e.preventDefault();
    addFilter(notIncludeInput, setNotIncludeInput, setNotIncludeFilters, notIncludeFilters);
  };

  // Event handler for "Either/Or" filter form submission
  const handleSubmitEitherOr = (e) => {
    e.preventDefault();
    addFilter(eitherOrInput, setEitherOrInput, setEitherOrFilters, eitherOrFilters);
  };

  /**
   * Renders the filter chips for a given list of filters.
   * Each chip includes the filter text and a clickable cross icon to remove it.
   * @param {string[]} filters - The array of filter strings to display as chips.
   * @param {string} filterType - The type of filter ('include', 'notInclude', 'eitherOr')
   * used to determine which state setter to call for removal.
   */
  const renderFilterChips = (filters, filterType) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {filters.map((filter) => (
        <span
          key={filter} // Using the filter string itself as the key because values are unique and stable
          className="flex items-center bg-gray-700 text-gray-300 text-sm px-3 py-1 rounded-lg shadow-sm max-w-full overflow-hidden whitespace-nowrap text-ellipsis transition-all duration-200 ease-in-out hover:bg-gray-600"
        >
          {filter.length>30 ? `${filter.slice(0,30)}...` : filter}
          <button
            onClick={() => {
              // Dynamically determine which setFilters and currentFilters to use based on filterType
              let targetSetFilters, targetCurrentFilters;
              if (filterType === 'include') {
                targetSetFilters = setIncludeFilters;
                targetCurrentFilters = includeFilters;
              } else if (filterType === 'notInclude') {
                targetSetFilters = setNotIncludeFilters;
                targetCurrentFilters = notIncludeFilters;
              } else { // 'eitherOr'
                targetSetFilters = setEitherOrFilters;
                targetCurrentFilters = eitherOrFilters;
              }
              removeFilter(filter, targetSetFilters, targetCurrentFilters);
            }}
            className="ml-2 text-gray-500 hover:text-gray-300 focus:outline-none transition-colors duration-200 ease-in-out"
            aria-label={`Remove ${filter}`} // Accessibility label for the remove button
          >
            &times; {/* HTML entity for a multiplication sign, commonly used as a small cross */}
          </button>
        </span>
      ))}
    </div>
  );

  return (
    <div className='p-6 bg-gray-900 text-gray-100 h-auto max-h-[500px] overflow-y-auto max-w-sm mx-auto no-scrollbar shadow-lg font-sans'>
      <h1 className="text-2xl font-semibold mb-6 text-gray-100 text-center">
        VibeFilter
      </h1>

      {/* Include Filters Section */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
        <form onSubmit={handleSubmitInc} className="flex gap-3 items-center">
          <input
            type="text"
            value={includeInput}
            onChange={(e) => setIncludeInput(e.target.value)}
            placeholder="Include keywords"
            className="flex-grow p-2.5 border border-gray-700 rounded-md bg-gray-700 text-gray-100 placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ease-in-out"
          />
          <button
            type="submit"
            className="bg-gray-700 text-gray-100 px-5 py-2.5 rounded-md font-medium shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-offset-1 focus:ring-offset-gray-800 transition-all duration-200 ease-in-out"
          >
            Add
          </button>
        </form>
        {renderFilterChips(includeFilters, 'include')}
      </div>

      {/* Do Not Include Filters Section */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
        <form onSubmit={handleSubmitNotInc} className="flex gap-3 items-center">
          <input
            type="text"
            value={notIncludeInput}
            onChange={(e) => setNotIncludeInput(e.target.value)}
            placeholder="Do not include keywords"
            className="flex-grow p-2.5 border border-gray-700 rounded-md bg-gray-700 text-gray-100 placeholder-gray-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-200 ease-in-out"
          />
          <button
            type="submit"
            className="bg-gray-700 text-gray-100 px-5 py-2.5 rounded-md font-medium shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-offset-1 focus:ring-offset-gray-800 transition-all duration-200 ease-in-out"
          >
            Add
          </button>
        </form>
        {renderFilterChips(notIncludeFilters, 'notInclude')}
      </div>

      {/* Either/Or Filters Section */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
        <form onSubmit={handleSubmitEitherOr} className="flex gap-3 items-center">
          <input
            type="text"
            value={eitherOrInput}
            onChange={(e) => setEitherOrInput(e.target.value)}
            placeholder="Either/Or keywords"
            className="flex-grow p-2.5 border border-gray-700 rounded-md bg-gray-700 text-gray-100 placeholder-gray-500 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 ease-in-out"
          />
          <button
            type="submit"
            className="bg-gray-700 text-gray-100 px-5 py-2.5 rounded-md font-medium shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-offset-1 focus:ring-offset-gray-800 transition-all duration-200 ease-in-out"
          >
            Add
          </button>
        </form>
        {renderFilterChips(eitherOrFilters, 'eitherOr')}
      </div>
    </div>
  );
}

export default Popup;
