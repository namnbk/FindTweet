"use client";

import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { SetStateAction, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Search } from "lucide-react";

type SearchBarType = {
  setTweetSearchId: React.Dispatch<SetStateAction<Id<"tweet_searches"> | null>>;
};

const SearchBar = ({ setTweetSearchId }: SearchBarType) => {
  // Variable
  const searchTweet = useMutation(api.tweet.searchTweet);
  const [input, setInput] = useState("");

  // Function
  const onSearch = async () => {
    // Check first
    if (input.trim() === "") {
      setTweetSearchId(null);
      return;
    }
    // Search on database
    const tweetSearchId = await searchTweet({ searchContent: input.trim() });
    // Update UI
    setTweetSearchId(tweetSearchId);
  };

  // Render
  return (
    <div className="flex items-center justify-center gap-x-2 p-2 mb-5">
      <button onClick={onSearch}>
        <Search className="h-4 w-4" />
      </button>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="px-2 focus-visible:ring-transparent bg-secondary"
        placeholder="https://x.com/Sentdex/status/1797270237437448281"
      />
    </div>
  );
};

export default SearchBar;
