"use client";

import React, { useState, useEffect } from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { Tabs, Tab } from "@heroui/tabs";
import { Avatar } from "@heroui/avatar";
import { 
  usersControllerGetTopReaders, 
  usersControllerGetTopAuthors, 
  usersControllerGetTopReadersByTime 
} from "@/src/client/sdk.gen";
import { Skeleton } from "@heroui/skeleton";

import { useLeaderboardStore, LeaderboardType } from "@/src/stores/useLeaderboardStore";

export const LeaderboardModal = () => {
  const [selectedTab, setSelectedTab] = useState<LeaderboardType>("readers");
  const { readers, authors, time, setAllLeaderboardData } = useLeaderboardStore();
  
  // Combine store data for easy access
  const allData = { readers, authors, time };
  
  // Loading state only matters if we have NO data at all
  const hasData = readers.length > 0 || authors.length > 0 || time.length > 0;
  const [isLoading, setIsLoading] = useState(!hasData);

  useEffect(() => {
    const fetchAllData = async () => {
      // If we don't have data, we show loading. If we do, we fetch in background (silent update)
      if (!hasData) setIsLoading(true);
      
      try {
        const [readersRes, authorsRes, timeRes] = await Promise.all([
          usersControllerGetTopReaders(),
          usersControllerGetTopAuthors(),
          usersControllerGetTopReadersByTime()
        ]);

        const extractData = (response: any) => {
          if (response && !response.error) {
            const responseData = response.data as any;
            return responseData?.leaderboard || responseData?.data?.leaderboard || [];
          }
          return [];
        };

        setAllDataLeaderboard({
          readers: extractData(readersRes),
          authors: extractData(authorsRes),
          time: extractData(timeRes)
        });
      } catch (error) {
        console.error("Failed to fetch leaderboards", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Helper to update store (renamed to match store export if needed, or just use the one from store)
  const setAllDataLeaderboard = setAllLeaderboardData;

  const renderList = () => {
    if (isLoading) {
      return Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-[#DCDCDC]">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 rounded mb-2" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
      ));
    }

    const currentData = allData[selectedTab];

    if (!Array.isArray(currentData) || currentData.length === 0) {
      return (
        <div className="text-center py-10 text-grey-3">
          <p>No data available yet.</p>
        </div>
      );
    }

    return currentData.map((item, index) => {
      // Handle case where user object might be null (as seen in logs) or nested
      const user = item.user || item;
      const displayName = user?.penName || (user?.firstName ? `${user.firstName} ${user.lastName}`.trim() : "Unknown User");
      const avatar = user?.avatar || "/person-with-sunglasses-smiling.jpg";
      
      return (
        <div key={index} className="flex items-center gap-4 py-3 border-b border-[#DCDCDC] last:border-0">
          <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
            index === 0 ? "bg-yellow-100 text-yellow-600" :
            index === 1 ? "bg-gray-100 text-gray-600" :
            index === 2 ? "bg-orange-100 text-orange-600" :
            "bg-transparent text-grey-3"
          }`}>
            {index + 1}
          </div>
          <Avatar 
            src={avatar} 
            size="sm"
          />
          <div className="flex-1">
            <p className={`text-sm text-primary-colour ${Magnetik_Medium.className}`}>
              {displayName}
            </p>
            <p className="text-xs text-grey-3">
              {selectedTab === "readers" && `${item.storiesRead || 0} stories read`}
              {selectedTab === "authors" && `${item.storiesWritten || 0} stories written`}
              {selectedTab === "time" && `${Math.round((item.totalReadingTime || 0) / 60)} mins read`}
            </p>
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <ModalHeader className="flex flex-col gap-1 pb-4">
        <h2 className={`text-xl text-center ${Magnetik_Bold.className}`}>
          Leaderboard
        </h2>
      </ModalHeader>
      <ModalBody className="pb-6 px-0 overflow-hidden">
        <div className="w-full px-6">
          <Tabs 
            selectedKey={selectedTab} 
            onSelectionChange={(key) => setSelectedTab(key as LeaderboardType)}
            variant="underlined"
            classNames={{
              tabList: "w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-complimentary-colour",
              tab: "max-w-fit px-0 h-12",
              tabContent: `group-data-[selected=true]:text-complimentary-colour ${Magnetik_Medium.className}`,
            }}
          >
            <Tab key="readers" title="Top Readers" />
            <Tab key="authors" title="Top Authors" />
            <Tab key="time" title="Reading Time" />
          </Tabs>
        </div>
        
        <div className="px-6 py-4 h-[400px] overflow-y-auto">
          {renderList()}
        </div>
      </ModalBody>
    </>
  );
};
