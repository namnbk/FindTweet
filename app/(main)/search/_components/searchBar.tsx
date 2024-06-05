"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation,} from "convex/react";
import { useState } from "react";
import { SearchType } from "../page";

type SearchBarType = {
  setSearch: React.Dispatch<React.SetStateAction<SearchType>>
}
const SearchBar = ({setSearch}: SearchBarType) => {
  // Variable
  const searchTweet = useMutation(api.tweet.addOrUpdateTweet);
  const [input, setInput] = useState("");

  // Function
  const onSearch = async () => {
    // Update database
    const searchId = await searchTweet({tweetId: input});
    // Update UI
    setSearch({searchId: searchId, searchValue: input});
  }

  // Render
  return (
    <div className="flex items-center justify-center gap-x-1 p-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="px-2 focus-visible:ring-transparent bg-secondary"
        placeholder="https://x.com/Sentdex/status/1797270237437448281"
      />
      <Button onClick={onSearch}>Search</Button>
    </div>
  );
};

export default SearchBar;
