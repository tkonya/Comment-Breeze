package com.utilities;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Created by Trevor on 1/3/2016.
 *
 * A class to keep track of failed attempts at things like passwords
 *
 * "id" could be either IP or username, or some other arbitrary identifier
 *
 */
public class LockoutHandler {

    private Map<String, LinkedList<LocalDateTime>> fails; // keeps track of which id failed when
    private int failExpirationMinutes = 180; // how long it takes for a failed attempt to roll off

    private int idLockoutAttempts = 3; // how many attempts a single id is allowed before they are locked out
    private int idLockoutMinutes = 60; // how many minutes an id is locked out for once they exceed the max number of lockout attempts
    private Map<String, LocalDateTime> idLockoutEndTimes; // if an ID is present here it means that they are locked out until the time specified

    private int globalLockoutAttempts = 20;
    private int globalLockoutMinutes = 60; // how many minutes everything is locked out once the global number of attempts is exceeded
    private LocalDateTime globalLockoutEndTime;

    public LockoutHandler() {
        fails = new HashMap<>();
        idLockoutEndTimes = new HashMap<>();
    }

    public void addFail(String id) {

        // add the id fail
        if (!fails.containsKey(id)) {
            fails.put(id, new LinkedList<>());
        }
        fails.get(id).add(LocalDateTime.now());

        rollOffExpiredFails();

        // cleanup the map if it gets too big
        if (idLockoutEndTimes.size() > 1000) {
            clearExpiredLockoutEndTimes();
        }

        if (getIdFailsCount(id, false) >= idLockoutAttempts) {
            idLockoutEndTimes.put(id, LocalDateTime.now().plusMinutes(idLockoutMinutes));
        }

        if (getGlobalFailsCount(false) >= globalLockoutAttempts) {
            globalLockoutEndTime = LocalDateTime.now().plusMinutes(globalLockoutMinutes);
        }

    }

    private void clearExpiredLockoutEndTimes() {
        Set<String> keys = idLockoutEndTimes.keySet();
        for (String key : keys) {
            if (idLockoutEndTimes.get(key).isBefore(LocalDateTime.now())) {
                idLockoutEndTimes.remove(key);
            }
        }
    }

    /**
     * Remove any expired fails in the
     */
    private void rollOffExpiredFails() {

        LocalDateTime rollOffTime = LocalDateTime.now().minusMinutes(failExpirationMinutes);

        if (fails.size() > 0) {
            List<String> idsToRemove = null;
            for (Map.Entry<String, LinkedList<LocalDateTime>> entry : fails.entrySet()) {
                while (entry.getValue().peek().isBefore(rollOffTime)) {
                    entry.getValue().remove();

                    // if the list is empty then remove the id from the map
                    if (entry.getValue().size() == 0) {
                        if (idsToRemove == null) {
                            idsToRemove = new ArrayList<>();
                        }
                        idsToRemove.add(entry.getKey());
                    }
                }
            }

            // remove keys with empty lists as their value
            if (idsToRemove != null) {
                for (String id : idsToRemove) {
                    fails.remove(id);
                }
            }
        }

    }

    public int getGlobalFailsCount() {
        return getGlobalFailsCount(true);
    }

    private int getGlobalFailsCount(boolean rollOffFirst) {
        int globalFailsCount = 0;

        if (rollOffFirst) {
            rollOffExpiredFails();
        }

        for (LinkedList<LocalDateTime> idFails : fails.values()) {
            globalFailsCount += idFails.size();
        }

        return globalFailsCount;
    }

    public int getIdFailsCount(String id) {
        return getIdFailsCount(id, true);
    }

    private int getIdFailsCount(String id, boolean rollOffFirst) {

        if (rollOffFirst) {
            rollOffExpiredFails();
        }

        if (fails.get(id) != null) {
            return fails.get(id).size();
        } else {
            return 0;
        }
    }

    /**
     * This should be used as a way to check whether there is a global lockout, and if so when it expires
     * Will also lazily expire lockouts if they are found
     *
     * @return the time the lockout will end or null if there is no lockout
     */
    public LocalDateTime getGlobalLockoutEndTime() {

        if (globalLockoutEndTime != null && globalLockoutEndTime.isBefore(LocalDateTime.now())) {
            globalLockoutEndTime = null;
        }

        return globalLockoutEndTime;
    }

    /**
     * This should be used as a way to check whether there is an id lockout, and if so when it expires
     * Will also lazily expire lockouts if they are found
     *
     * @param id the id that you want to check
     * @return the time the lockout will end or null if there is no lockout
     */
    public LocalDateTime getIdLockoutEndTime(String id) {

        if (idLockoutEndTimes.get(id) != null && idLockoutEndTimes.get(id).isBefore(LocalDateTime.now())) {
            idLockoutEndTimes.remove(id);
        }

        return idLockoutEndTimes.get(id);
    }

    public int getIdLockoutTriesLeft(String id) {
        return idLockoutAttempts - (fails.containsKey(id) ? fails.get(id).size() : 0);
    }

}
