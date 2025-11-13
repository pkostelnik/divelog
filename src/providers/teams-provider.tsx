'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as microsoftTeams from '@microsoft/teams-js';

interface TeamsContext {
  isInTeams: boolean;
  isInitialized: boolean;
  context?: microsoftTeams.app.Context;
  theme?: string;
  userObjectId?: string;
  teamId?: string;
  channelId?: string;
  getAuthToken: () => Promise<string | null>;
}

const TeamsContext = createContext<TeamsContext>({
  isInTeams: false,
  isInitialized: false,
  getAuthToken: async () => null,
});

export function useTeams() {
  return useContext(TeamsContext);
}

interface TeamsProviderProps {
  children: ReactNode;
}

export function TeamsProvider({ children }: TeamsProviderProps) {
  const [isInTeams, setIsInTeams] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [context, setContext] = useState<microsoftTeams.app.Context>();
  const [theme, setTheme] = useState<string>();

  useEffect(() => {
    const initTeams = async () => {
      try {
        // Check if running in Teams context
        await microsoftTeams.app.initialize();
        setIsInTeams(true);

        // Get Teams context
        const teamsContext = await microsoftTeams.app.getContext();
        setContext(teamsContext);

        // Get initial theme
        setTheme(teamsContext.app.theme as string);

        // Listen for theme changes
        microsoftTeams.app.registerOnThemeChangeHandler((newTheme) => {
          setTheme(newTheme as string);
        });

        console.log('[Teams] Initialized in Teams context', {
          user: teamsContext.user?.id,
          team: teamsContext.team?.groupId,
          channel: teamsContext.channel?.id,
        });
      } catch (error) {
        // Not running in Teams - this is normal for web browser access
        setIsInTeams(false);
        console.log('[Teams] Running in web browser mode');
      } finally {
        setIsInitialized(true);
      }
    };

    initTeams();
  }, []);

  const getAuthToken = async (): Promise<string | null> => {
    if (!isInTeams) {
      return null;
    }

    try {
      const token = await microsoftTeams.authentication.getAuthToken();
      return token;
    } catch (error) {
      console.error('[Teams] Failed to get auth token:', error);
      return null;
    }
  };

  const value: TeamsContext = {
    isInTeams,
    isInitialized,
    context,
    theme,
    userObjectId: context?.user?.id,
    teamId: context?.team?.groupId,
    channelId: context?.channel?.id,
    getAuthToken,
  };

  return <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>;
}
