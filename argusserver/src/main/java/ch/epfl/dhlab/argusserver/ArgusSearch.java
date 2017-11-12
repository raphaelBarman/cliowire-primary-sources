package ch.epfl.dhlab.argusserver;

import com.achteck.misc.types.TerminateControl;
import com.google.gson.Gson;
import de.planet.itrtech.types.IProgressStatus;
import de.planet.ted_argussearch_sdk.ArgusSearch_SDK;
import de.planet.ted_argussearch_sdk.api.IArgusSearchSDK;

import java.util.*;

public class ArgusSearch {
    private final static ArgusSearch argusSearch = new ArgusSearch();

    private final static String SEPARATOR = "===================================================";
    private final Gson gson = new Gson();
    private final IArgusSearchSDK sdk = new ArgusSearch_SDK();

    private boolean verbose = false;

    private boolean isCaseSensitive;
    private boolean isEscaping;
    private boolean isExpertMode;
    private boolean isKWS;
    private TerminateControl terminateControl = new TerminateControl() {
        boolean terminated = false;
        @Override
        public boolean isTerminated() {
            return terminated;
        }

        @Override
        public void setTerminate(boolean b) {
            terminated = b;
        }
    };

    private IProgressStatus progressStatus =  new IProgressStatus() {
        @Override
        public void setStatus(double v) {
        }

        @Override
        public void done() {

        }
    };


    private ArgusSearch() {}

    public static ArgusSearch getInstance() {
        return argusSearch;
    }

    public String search(String s, boolean isCaseSensitive, boolean isEscaping, boolean isExpertMode, boolean isKWS) {
        printIfVerbose(SEPARATOR);
        printIfVerbose("Searching for " + s);
        sdk.getSetup().setCaseSensitive(isCaseSensitive);
        sdk.getSetup().setEscaping(isEscaping);
        sdk.getSetup().setExpertMode(isExpertMode);
        sdk.getSetup().setKWS(isKWS);
        sdk.selectSearchSpace(new ArrayList(Arrays.asList("D0")));
        terminateControl.setTerminate(false);
        List<SearchResult> results = SearchResult.transformSearchResults(sdk.getSearchResult(s, terminateControl, progressStatus));
        resetParams();
        printIfVerbose(SEPARATOR);
        return gson.toJson(results);
    }

    public void interrupt() {
        terminateControl.setTerminate(true);
    }

    public String search(String s) {
        return search(s, isCaseSensitive, isEscaping, isExpertMode, isKWS);
    }

    public void initialize() {
        printIfVerbose(SEPARATOR);
        printIfVerbose("Initializing...");

        sdk.init();
        if(streamDataNeedsUpdate()) {
            printIfVerbose("Data stream not up-to-date, initializing...");
            Map<String, String> collectionMap = sdk.getStockInformation().getCollectionMap();
            for (String docID : collectionMap.keySet()) {
                System.out.println("create stream for " + docID);
                sdk.createStreamData(docID);
            }
        }
        isCaseSensitive = sdk.getSetup().isCaseSensitive();
        isEscaping = sdk.getSetup().isEscaping();
        isExpertMode = sdk.getSetup().isExpertMode();
        isKWS = sdk.getSetup().isKWS();

        printIfVerbose(SEPARATOR);
    }

    public void destroy() {
        printIfVerbose(SEPARATOR);
        printIfVerbose("Shutting down instance");
        sdk.shutdown();
        printIfVerbose(SEPARATOR);
    }

    public boolean streamDataNeedsUpdate() {
        Set<String> pageIds = sdk.getStockInformation().getPageMap().keySet();
        Map<String, Integer> localStreamFilesExisting = sdk.isLocalStreamFilesExisting(pageIds, true);
        return  localStreamFilesExisting.containsValue(1) ||
                localStreamFilesExisting.containsValue(2) ||
                localStreamFilesExisting.containsValue(3);

    }

    public void setVerbose(boolean verbose) {
        this.verbose = verbose;
    }

    private void printIfVerbose(String s) {
        if(verbose) {
            System.out.println(s);
        }
    }

    private void resetParams() {
        sdk.getSetup().setCaseSensitive(isCaseSensitive);
        sdk.getSetup().setEscaping(isEscaping);
        sdk.getSetup().setExpertMode(isExpertMode);
        sdk.getSetup().setKWS(isKWS);
    }
}
