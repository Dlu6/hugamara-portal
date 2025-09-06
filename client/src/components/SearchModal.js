import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  User,
  ShoppingCart,
  Calendar,
  Package,
  Users,
  Calendar as EventIcon,
  Ticket,
  ChefHat,
} from "lucide-react";
import searchService from "../services/searchService";
import { useToast } from "./ui/ToastProvider";

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const { error: showError } = useToast();

  const tabs = [
    { id: "all", label: "All", icon: Search },
    { id: "guests", label: "Guests", icon: User },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "reservations", label: "Reservations", icon: Calendar },
    { id: "menu", label: "Menu", icon: ChefHat },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "staff", label: "Staff", icon: Users },
    { id: "events", label: "Events", icon: EventIcon },
    { id: "tickets", label: "Tickets", icon: Ticket },
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length >= 2) {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setResults(null);
      setSuggestions([]);
    }
  }, [query, activeTab]);

  const performSearch = async () => {
    if (query.length < 2) {
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === "all") {
        const response = await searchService.globalSearch(query, 10);
        setResults(response.results);
      } else {
        const response = await searchService.quickSearch(query, activeTab);
        setSuggestions(response.suggestions || []);
      }
    } catch (error) {
      console.error("Search error:", error);
      showError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    // Navigate to the specific item (implement navigation logic)
    console.log("Navigate to:", suggestion);
  };

  const getResultIcon = (type) => {
    const iconMap = {
      guest: User,
      order: ShoppingCart,
      reservation: Calendar,
      menu: ChefHat,
      inventory: Package,
      staff: Users,
      event: EventIcon,
      ticket: Ticket,
    };
    return iconMap[type] || Search;
  };

  const formatResult = (item, type) => {
    switch (type) {
      case "guest":
        return {
          id: item.id,
          title: `${item.firstName} ${item.lastName}`,
          subtitle: item.email,
          type: "guest",
        };
      case "order":
        return {
          id: item.id,
          title: item.orderNumber,
          subtitle: `$${item.totalAmount} - ${item.status}`,
          type: "order",
        };
      case "reservation":
        return {
          id: item.id,
          title: item.reservationNumber,
          subtitle: `${item.partySize} people - ${item.status}`,
          type: "reservation",
        };
      case "menu":
        return {
          id: item.id,
          title: item.name,
          subtitle: `${item.category} - $${item.price}`,
          type: "menu",
        };
      case "inventory":
        return {
          id: item.id,
          title: item.itemName,
          subtitle: `Stock: ${item.currentStock} - ${item.category}`,
          type: "inventory",
        };
      case "staff":
        return {
          id: item.id,
          title: item.employeeId,
          subtitle: `${item.position} - ${item.department}`,
          type: "staff",
        };
      case "event":
        return {
          id: item.id,
          title: item.title,
          subtitle: `${item.eventType} - ${new Date(
            item.startDate
          ).toLocaleDateString()}`,
          type: "event",
        };
      case "ticket":
        return {
          id: item.id,
          title: item.ticketNumber,
          subtitle: `${item.title} - ${item.status}`,
          type: "ticket",
        };
      default:
        return item;
    }
  };

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        </div>
      );
    }

    if (activeTab === "all" && results) {
      // Check if any category has results
      const hasResults = Object.values(results).some(
        (items) => items && items.length > 0
      );

      if (!hasResults) {
        return (
          <div className="text-center py-8 text-text-secondary">
            No results found
          </div>
        );
      }

      return (
        <div className="space-y-6">
          {Object.entries(results).map(([category, items]) => {
            if (!items || items.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="text-sm font-semibold text-text-primary mb-3 capitalize">
                  {category} ({items.length})
                </h3>
                <div className="space-y-2">
                  {items.map((item) => {
                    const formatted = formatResult(item, category.slice(0, -1)); // Remove 's' from plural
                    const Icon = getResultIcon(formatted.type);

                    return (
                      <div
                        key={item.id}
                        className="flex items-center p-3 rounded-lg bg-primary-bg-secondary hover:bg-primary-bg-accent cursor-pointer transition-colors"
                        onClick={() => handleSuggestionClick(formatted)}
                      >
                        <Icon className="w-5 h-5 text-accent-primary mr-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {formatted.title}
                          </p>
                          <p className="text-xs text-text-secondary truncate">
                            {formatted.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (!suggestions.length) {
      return (
        <div className="text-center py-8 text-text-secondary">
          {query.length >= 2 ? "No results found" : "Start typing to search..."}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {suggestions.map((suggestion) => {
          const Icon = getResultIcon(suggestion.type);

          return (
            <div
              key={suggestion.id}
              className="flex items-center p-3 rounded-lg bg-primary-bg-secondary hover:bg-primary-bg-accent cursor-pointer transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <Icon className="w-5 h-5 text-accent-primary mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {suggestion.text}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {suggestion.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-16 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-primary-bg rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-primary-bg border-b border-border px-6 pt-6 pb-4 rounded-t-lg z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">
                Search
              </h3>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary text-3xl font-bold p-2 hover:bg-primary-bg-accent rounded-full transition-colors"
                title="Close Search"
              >
                ×
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="px-6 py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search guests, reservations, tickets..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-primary-bg-secondary border border-border text-text-primary rounded-lg focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
              />
            </div>

            <div className="flex space-x-1 mb-4 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "bg-accent-primary text-white"
                        : "bg-primary-bg-secondary text-text-secondary hover:bg-primary-bg-accent hover:text-text-primary"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="max-h-96 overflow-y-auto">{renderResults()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
