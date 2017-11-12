package ch.epfl.dhlab.argusserver;

import de.planet.math.geom2d.types.Polygon2DInt;
import de.planet.ted_argussearch_sdk.api.ISearchResults;
import de.planet.ted_argussearch_sdk.types.SearchResults;

import java.util.ArrayList;
import java.util.List;

public class SearchResult {
    private String bestString;
    private String matchString;
    private double score;
    private String filename;
    private Polygon2DInt polygon;
    private Polygon2DInt polygonTrans;
    private double angle;
    private Polygon2DInt line;
    private String pageID;
    private double relStart;
    private double relWidth;
    private String textType;
    private String netName;

    public SearchResult(ISearchResults.ISearchResult searchResult) {
        this.bestString = searchResult.getBestString();
        this.matchString = searchResult.getMatchString();
        this.score = searchResult.getScore();
        this.filename = searchResult.getFilename();
        this.polygon = searchResult.getPolygon();
        this.polygonTrans = searchResult.getPolygonTrans();
        this.angle = searchResult.getAngle();
        this.line = searchResult.getLine();
        this.pageID = searchResult.getPageID();
        this.relStart = searchResult.getRelStart();
        this.relWidth = searchResult.getRelWidth();
        this.textType = searchResult.getTextType();
        this.netName = searchResult.getNetName();
    }

    public static List<SearchResult> transformSearchResults(ISearchResults searchResults){
        List<SearchResult> results = new ArrayList<>();
        for (ISearchResults.ISearchResult searchResult : (List<ISearchResults.ISearchResult>) searchResults.getResults()) {
            results.add(new SearchResult(searchResult));
        }
        return results;
    }
}
