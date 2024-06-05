"use client"

import { useState } from "react";
import SearchBar from "./_components/searchBar";
import TweetResult from "./_components/tweetResult";
import { Id } from "@/convex/_generated/dataModel";

export type SearchType = {
    searchId: 0 | Id<"_scheduled_functions">; 
    searchValue: string;
};

const SearchPage = () => {
    // Hooks
    const [search, setSearch] = useState<SearchType>({searchId: 0, searchValue: ""});

    // Render
    return (
        <div className="md:px-[20%]">
            <SearchBar setSearch={setSearch}/>
            {search.searchValue === "" ? <></> : <TweetResult search={search}/>}
        </div>
    );
}
 
export default SearchPage;